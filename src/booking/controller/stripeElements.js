const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const FlightBooking=require('../model/flight_booking')
const Transaction = require('../model/transaction')

exports.stripeElements=async(req,res)=>{
    console.log('[+]Init stripe elements...')
    FlightBooking.findById(req.bookingId).exec(async(err,data)=>{
        if(err||!data){
            return res.json({error:true,message:"Wrong booking id"})
        }

        const fares = (data.invoice_fare)*100
        console.log('[+]Fares ',fares)

        let newTransaction = new Transaction();
        const payment_intent = await stripe.paymentIntents.create({
            amount:fares,
            currency:process.env.STRIPE_CURRENCY,

            metadata:{
                "bookingId":String(data._id),
                "invoice":String(newTransaction._id),
                "serviceType":process.env.STRIPE_SERVICE1
            }
        })
        data.transaction= newTransaction._id;
        newTransaction.payIntentId=payment_intent.id
        newTransaction.clientSecret=payment_intent.client_secret
        // data.stripe_data.pay_intentId=payment_intent.id
        // data.stripe_date.client_secret=payment_intent.client_secret
        console.log('[+]Destory stripe elements.. ',payment_intent.client_secret)
        await newTransaction.save((err,d)=>{
            console.log('[+]Transaction saved')
        })
        // data.save((err,data)=>{
        //     return res.json({
        //         error:false,
        //         paymentIntents:newTransaction.clientSecret,
        //         fare:fares,
        //         // cancelLink:`http://localhost:6030/api/v1/flight/cancel/${req.bookingId}`,
        //         bookingId:req.bookingId
        //     })
        // })
        await data.save((err,d)=>{
            console.log('[+]Flight Booking saved')
        })
        return res.json({
            error:false,
            paymentIntents:newTransaction.clientSecret,
            fare:fares,
            cancelLink:`http://localhost:6030/api/v1/flight/cancel/${req.bookingId}`,
            bookingId:req.bookingId
        })

    })
}