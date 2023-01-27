const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Transaction = require('../flight/model/transaction')




exports.stripeRefund= async(data)=>{
      console.log('[+]Stripe refund init...')
      try{
            const transaction= await Transaction.findById(data.transactionId)
            if(!transaction){
                  throw {message:`No transaction is found for the flightBooking BookingID`,bookingId:req.bookingId,"transaction":flight.transaction}
            }
            
            if(transaction.refund.status==="succeeded"){
                  throw {message:"The refund is already done"}
            }
            
            if(transaction.status==="unpaid")
            {
                  throw {message:"The payment is not done completely"}
            }
            console.log('[+]Error check...')
            
            try
            {
                  const refund = await stripe.refunds.create({
                        payment_intent:transaction.payIntentId
                  })
        
                    transaction.refund.id=refund.id
                    transaction.refund.amount=refund.amount
                    transaction.refund.reason=data.reason?data.reason:""
                    transaction.refund.status=refund.status
                    transaction.status="refunded"
                    await transaction.save()
                    console.log("[+]Refund successfull...")
                    return {
                                error:false,
                                amount:refund.amount,
                                status:{
                                      payment:"refunded",
                                      booking:"cancled"
                                }

                          }
                    
              }
              catch(e)
              {
                    console.log('[+]Error from creating refund ',e.raw)
                    console.log('[+]Error from creating refund ',e.message)
                    if(e.raw.code==="charge_already_refunded")
                  {
                        const charge = await stripe.charges.retrieve(transaction.chargeId)
                        console.log('[+]Refunded charge ',charge.refunds.data[0])
                        let refund=charge.refunds.data[0]
                        transaction.refund.id=refund.id
                        transaction.refund.amount=refund.amount
                        transaction.refund.reason=data.reason?data.reason:""
                        transaction.refund.status=refund.status
                        // transaction.status="refunded"
                        
                        
                        // await flight.save()
                        await transaction.save()
                        console.log("REFUND ALREADY DONE")
                        
                             return {
                                    error:false,
                                    message:"the refund is already done",
                                    amount:refund.amount,
                                    status:{
                                          payment:"refunded",
                                          booking:"cancled"
                                    }
                              }
                        
                  }
                  else
                  {
                        throw {
                                    message:e.raw.code
                              }
                        
                  }
             
                 
              }


      }catch(e){
            console.log('[**]',e.message)
            return{
                  error:true,
                  message:e.message 
            }
      }
}