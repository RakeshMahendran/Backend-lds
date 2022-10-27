require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const FlightBooking = require('../model/flight_booking')
const {ticketing} = require('./ticketing')


exports.successPayment=async(req,res)=>{
    FlightBooking.findById(req.bookingId).exec((err,bookingData)=>{
        if(err||!bookingData){
            console.log('[+]Error',err)
            return res.json({
                error:true,
                message:"Unable to find the booking(wrong booking id)"
            })
        }
        // const{pay_intentId,chargeId,checkoutSessionId}=bookingData.stripe_data
        if(bookingData.booking_status==="init"){
            return res.json({
                error:true,
                message:"PNR is not yet generated"
            })
        }
        stripe.checkout.sessions.retrieve(bookingData.stripe_data.checkoutSessionId).then(async(c)=>{
            console.log('[+]Payment charge ',c)
            if(c.payment_status==="unpaid"){
                bookingData.payment_status="unpaid"
                if(c.status==="expired"){
                    //init new checkout session
                    res.redirect(`/api/v1/flight/updatePaymentPrice/${req.bookingId}`)
                }
                else{

                    await bookingData.save()
                    return res.json(
                        {
                            error:true,
                            message:"The payment is not yet completed",
                            paymentURI:c.url
                        }
                        )
                }
            }
            else if(c.payment_status==="paid"){
                bookingData.payment_status="paid"
                if(bookingData.booking_status==="PNR"){
                    bookingData.booking_status="ticketing"
                    //init the ticketing asyncly
                    ticketing(bookingData).then(d=>{
                        console.log("[+]",d)
                    })
                    await bookingData.save()
                    return res.json(
                        {
                            error:false,
                            message:"The payment is sucessfull you ticketing will be done soon",
                            data:bookingData
                        }
                    )

                }
                else if(bookingData.booking_status==="ticketing"){
                    return res.json(
                        {
                            error:false,
                            message:"Your payment is done and your ticket is in processing",
                            data:bookingData
                        }
                    )   
                }
                
            }
            
        })
    })

}