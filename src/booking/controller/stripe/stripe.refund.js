const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Transaction = require('../../model/transaction')


exports.stripeRefund=async(req,res)=>{
        console.log('STRIPE REFUND INITIATED[+]')
      //   console.log(req.body)
        try
        {
            const transaction= await Transaction.findById(req.body.id)
            if(!transaction){
                  throw {message:`No transaction is found for the flightBooking BookingID`,bookingId:req.bookingId,"transaction":flight.transaction}
              }
              if(transaction.refund.status==="succeeded"){
                  throw "The refund is already done"
              }
              if(transaction.status==="unpaid")
              {
                  throw "The payment is not done completely"
              }
              try
              {
                  const refund = await stripe.refunds.create({
                        payment_intent:transaction.payIntentId
                    })
        
                    transaction.refund.id=refund.id
                    transaction.refund.amount=refund.amount
                    transaction.refund.reason=req.body.reason
                    transaction.refund.status=refund.status
                    transaction.status="refunded"
                    await transaction.save()
                    console.log("REFUND SUCCESSFULL")
                    return res.json(
                          {
                                error:false,
                                amount:refund.amount,
                                status:{
                                      payment:"refunded",
                                      booking:"cancled"
                                }

                          }
                    )
              }
              catch(e)
              {
                    console.log('[+]Error from creating refund ',e.raw)
                    if(e.raw.code==="charge_already_refunded")
                  {
                        const charge = await stripe.charges.retrieve(transaction.chargeId)
                        console.log('[+]Refunded charge ',charge.refunds)
                        let refund=charge.refunds[0]
                        transaction.refund.id=refund.id
                        transaction.refund.amount=refund.amount
                        transaction.refund.reason=req.body.reason
                        transaction.refund.status=refund.status
                        // transaction.status="refunded"
                       
                        // await flight.save()
                        await transaction.save()
                        console.log("REFUND ALREADY DONE")
                        res.json(
                              {
                                    error:true,
                                    message:"the refund is already done",
                                    amount:refund.amount,
                                    status:{
                                          payment:"refunded",
                                          booking:"cancled"
                                    }
                              }
                        )
                  }
                  else
                  {
                        res.json(
                              {
                                    error:true,
                                    message:e.raw.code
                              }
                        )
                  }
             
                 
              }
        }
        catch(e)
        {
              res.json(
                    {
                          error:true,
                          message:e
                    }
              )
        }


}