const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
//IMPORTING TRANSACTION SCHEMA
const Transaction=require('../booking/model/transaction')
exports.stripeCreate=async(req,res)=>{
    console.log('[+]STRIPE INITIATION')
//     console.log(req.body)
      try{
            //CREATING A NEW TRANSACTION TO STORE IN THE TABLE
             let newTransaction = new Transaction();
            const payment_intent = await stripe.paymentIntents.create({
                  amount:req.body.amount,
                  currency:process.env.STRIPE_CURRENCY,
                  metadata:{
                      "bookingId":String(req.body.id),
                      "invoice":String(newTransaction._id),
                      "serviceType":process.env.STRIPE_SERVICE1
                  }
              })
                         //   console.log("ID",payment_intent.id)
                        //   console.log("CLIENT_SECRET",payment_intent.client_secret)

             
              newTransaction.payIntentId=payment_intent.id
              newTransaction.clientSecret=payment_intent.client_secret
              newTransaction.service=req.body.service
              await newTransaction.save((err,d)=>{
                  console.log('[+]TRANSACTION SAVED')
              })
              let result={
                  payment_intent_ID:payment_intent.id,
                  payment_intent_CLIENT_SECRET:payment_intent.client_secret
              }
              res.json({
                    error:false,
                    transaction_id:newTransaction._id,
                    stripe:result
              })
      }
      catch(e){
            res.json({
                  error:true,
                  message:e
            })
      }
}