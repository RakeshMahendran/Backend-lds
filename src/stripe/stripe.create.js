const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
//IMPORTING TRANSACTION SCHEMA
const Transaction=require('../flight/model/transaction')

exports.stripeCreate=async(data)=>{
      console.log('[+]Stripe init...')
      console.log('[+]Stripe init data ',data)
      try{
            let newTransaction = new Transaction()
            const payment_intent = await stripe.paymentIntents.create({
                  amount:data.amount,
                  currency:process.env.STRIPE_CURRENCY,
                  metadata:{
                      "bookingId":String(data.bookingId),
                      "invoice":String(newTransaction._id),
                      "serviceType":data.service
                  }
              })

            newTransaction.payIntentId=payment_intent.id
            newTransaction.clientSecret=payment_intent.client_secret
            newTransaction.service=data.service
            await newTransaction.save()
            console.log('[+]Saved transaction ',newTransaction)
            return {
                  error:false,
                  payintent_client_secret:payment_intent.client_secret,
                  transaction_id:newTransaction._id
            }

      }catch(e){
            console.log('[**]Error stripecreate ',e.message)
            return {
                  error:true,
                  message:e.message
            }
      }
}