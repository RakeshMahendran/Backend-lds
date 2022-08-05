require('dotenv').config()
const stripe=require('stripe')(process.env.STRIPE_SECRET_KEY)


const FlightBooking=require('../model/flight_booking')

exports.BookingDetails=(req,res)=>{
    FlightBooking.findById(req.bookingId).populate('flight_passenger_id').populate('flight_segments').exec((err,data)=>{
        if(err||!data){
            console.log('[+]unable to locate the booking detials')
            return res.send('Unable to find the booking detials')
        }
        stripe.paymentIntents.retrieve(data.stripe_data.pay_intentId).then(c=>{
            if(c.status==="succeeded"){
                data.payment_status="paid"
                data.stripe_data.chargeId=c.charges.data[0].id;
                console.log('[+]Amount paid');
            }

            else{
                console.log('[+]Amount not paid')
            }
            data.save((err,data)=>{
                if(err||!data){
                    console.log('[+]Unable to update');
                    return res.status(400).json({"BookingDetials":data})
                }
                else{
                    // console.log('[+]Updated flight booking',data)
                    return res.status(200).json({"BookingDetials":data})

                }
            })

        })
        
    })
}