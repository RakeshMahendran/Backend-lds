const FlightBooking=require('../model/flight_booking')
const Transaction = require('../model/transaction')
const axios=require('axios')
exports.stripeElements=async(req,res)=>{
    console.log('[+]Init stripe elements...')
    FlightBooking.findById(req.bookingId).exec(async(err,data)=>{
        if(err||!data){
            return res.json({error:true,message:"Wrong booking id"})
        }

        const fares = Math.round((data.invoice_fare)*100)
        console.log('[+]Fares ',fares)
        //calling stripe endpoint of coreservice
        try
        {
            const stripeResponse=await axios.post(`http://52.91.140.13:88/stripe/create`,{
                amount:fares,
                id:data._id,
                service:'flights'
            })
            if(stripeResponse.data)
            {
                if(stripeResponse.data.error==false)
                {
                    //storing the transaction id into the data
                    data.transaction= stripeResponse.data.transaction_id;
                    await data.save((err,d)=>{
                        console.log('[+]Flight Booking saved')
                    })
                    return res.json({
                        error:false,
                        paymentIntents:stripeResponse.data.stripe.payment_intent_CLIENT_SECRET,
                        fare:fares,
                        fares:{
                            markup:data.markup,
                            pay_fare:data.pay_fare,
                            invoice_fare:data.invoice_fare,
                            passenger:data.flight_passenger_id.length
                        },
                        cancelLink:`http://localhost:6030/api/v1/flight/cancel/${req.bookingId}`,
                        bookingId:req.bookingId
                    })
                }
            }
                
        }
        catch(e)
        {
            res.json(
                {
                    error:true,
                    response:"Error while creating stripe payment Intent",
                    message:e.message
                }
            )
        }
        

    })
}