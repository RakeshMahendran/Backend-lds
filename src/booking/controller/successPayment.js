require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const FlightBooking = require('../model/flight_booking')
const {ticketing} = require('./ticketing')


exports.successPayment=async(req,res)=>{
    console.log('[+]Success payment check')
    FlightBooking.findById(req.bookingId).populate('flight_passenger_id').populate({path:'flight_journey',populate:{path:'journey_segments',model:'FlightSegment'}}).exec((err,bookingData)=>{
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
        /*
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
            
        })*/
        
        stripe.paymentIntents.retrieve(bookingData.stripe_data.pay_intentId).then(async(c)=>{
            console.log('[+]payment intent ',c)
            
            if(c.status==="requires_payment_method"){
                bookingData.payment_status="unpaid"
                await bookingData.save();

                return res.json({
                    error:true,
                    message:"your payment is not yet done",
                    paymentIntents:c.client_secret,
                    cancelLink:`http://localhost:6030/api/v1/flight/cancel/${req.bookingId}`
                })
                
            }
            else if(c.status==="succeeded"){
                bookingData.payment_status="paid"
                await bookingData.save();

                if(bookingData.booking_status==="PNR"){
                    return res.json({
                        error:false,
                        message:"payment is succeeded, and your ticket will be processed soon",
                        cancelLink:`http://localhost:6030/api/v1/flight/cancel/${req.bookingId}`,
                        data:bookingData
                    })

                }
                else if(bookingData.booking_status==="ticketing"){
                    //read ticket
                    return res.json(
                        {
                            error:false,
                            message:"Your payment is done and your ticket is been processed",
                            data:bookingData
                        }
                    )
                }
            }

          })
    })
}

exports.payintent=(req,res)=>{
    console.log('[+]Stripe webhook event activated ')
    console.log(req.body)
    let type=req.body.type;
    if(type==="payment_intent.created"){
        console.log('[+]Payintent created ')
    }
    else if(type==='payment_intent.succeeded'){
        let BookingId = req.body.data.object.metadata.invoice
        console.log('[+]payintent sucess ===> metadata ',req.body.data.object.metadata)
        FlightBooking.findById(BookingId).exec(async(err,data)=>{
            if(err||!data){
                console.log('[+]Unable to find the data for the particular id')
                return
            }
            data.payment_status="paid"
            // if(data.booking_status==="PNR"){
            //     data.booking_status="ticketing"
            //     ticketing(data).then(d=>{
            //         console.log("[+]",d)
            //     })
            // }
            await data.save();
            //init ticketing
        })
    }
    res.status(200)
    res.send()
}
