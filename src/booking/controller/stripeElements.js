const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const FlightBooking=require('../model/flight_booking')

exports.stripeElements=async(req,res)=>{
    console.log('[+]Init stripe elements...')
    FlightBooking.findById(req.bookingId).exec(async(err,data)=>{
        if(err||!data){
            return res.json({error:true,message:"Wrong booking id"})
        }

        const fares = (data.invoice_fare)*100
        console.log('[+]Fares ',fares)

        const payment_intent = await stripe.paymentIntents.create({
            amount:fares,
            currency:"inr",
            metadata:{
                "invoice":String(data._id)
            }
        })

        data.stripe_data.pay_intentId=payment_intent.id
        // data.stripe_date.client_secret=payment_intent.client_secret
        console.log('[+]Destory stripe elements.. ',payment_intent.client_secret)
        data.save((err,data)=>{
            return res.json({
                error:false,
                paymentIntents:payment_intent.client_secret,
                fare:fares,
                cancelLink:`http://localhost:6030/api/v1/flight/cancel/${req.bookingId}`,
                bookingId:req.bookingId
            })
        })
    })
}