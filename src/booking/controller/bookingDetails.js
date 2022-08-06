require('dotenv').config()
const stripe=require('stripe')(process.env.STRIPE_SECRET_KEY)


const { populate } = require('../model/flight_booking')
const FlightBooking=require('../model/flight_booking')

exports.BookingDetails=(req,res)=>{
    FlightBooking.findById(req.bookingId).populate('flight_passenger_id').populate('flight_segments').exec((err,data)=>{
        if(err||!data){
            console.log('[+]unable to locate the booking detials')
            return res.send('Unable to find the booking detials')
        }
        if(data.payment_status==="paid"){

            data.stripe_data.pay_intentId=undefined
            data.stripe_data.chargeId=undefined
            data.stripe_data.checkoutSessionId=undefined

            return res.status(200).json({"BookingDetials":data})

        }

            stripe.paymentIntents.retrieve(data.stripe_data.pay_intentId).then(c=>{
                if(c.status==="succeeded"){
                    data.payment_status="paid"
                    data.stripe_data.chargeId=c.charges.data[0].id;
                    console.log('[+]Amount paid');
                    data.save((err,data)=>{
                        if(err||!data){
                            console.log('[+]Unable to update');
                            return res.status(400).json({"BookingDetials":data})
                        }
                        else{
                            data.stripe_data.pay_intentId=undefined
                            data.stripe_data.chargeId=undefined
                            data.stripe_data.checkoutSessionId=undefined
    
                            // console.log('[+]Updated flight booking',data)
                        return res.status(200).json({"BookingDetials":data})
    
                    }
                })
                }
                
                else{
                    stripe.checkout.sessions.retrieve(data.stripe_data.checkoutSessionId).then(c=>{
                        return res.status(200).json({"url":c.url})
                    })
                    console.log('[+]Amount not paid')
                }

                
            
        })
    
        
    })
}