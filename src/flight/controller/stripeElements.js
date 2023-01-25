const FlightBooking=require('../model/flight_booking')
const {stripeCreate}= require("../../stripe/stripe.create")

exports.stripeElements=async(req,res)=>{
    console.log('[+]Init stripe elements...')
    FlightBooking.findById(req.bookingId).exec(async(err,data)=>{
        if(err||!data){
            return res.json({error:true,message:"Wrong booking id"})
        }

        const fares = Math.round((data.invoice_fare+seat_charge_total_fare+seat_assignment_total_fare)*100)
        console.log('[+]Fares ',fares)
        //calling stripe endpoint of coreservice
        // const stripeResponse=await axios.post(`${process.env.CORESERVICE}/stripe/create`,{
        //     amount:fares,
        //     id:data._id,
        //     service:'flights'
        // })

        try{

            const stripeData= await stripeCreate({
                amount:fares,
                bookingId:data._id,
                service:"flights"
            })

            if(stripeData.error){
                throw {
                    message:stripeData.message
                }
            }
            console.log('[+]Stripe data ',stripeData)
            data.transaction=stripeData.transaction_id
            await data.save()

            res.json({
                error:false,
                paymentIntents:stripeData.payintent_client_secret,
                fare:fares,
                fares:{
                    markup:data.markup,
                    pay_fare:data.pay_fare,
                    invoice_fare:data.invoice_fare,
                    passenger:data.flight_passenger_id.length
                },
                // cancelLink:`http://localhost:6030/api/v1/flight/cancel/${req.bookingId}`,
                bookingId:req.bookingId
            })

        }catch(e){
            res.json({
                error:true,
                message:e.message
            })
        }

    })
}