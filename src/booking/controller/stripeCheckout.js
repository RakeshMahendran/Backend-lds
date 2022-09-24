
const FlightBooking = require('../model/flight_booking')
const stripe = require('stripe').Stripe(process.env.STRIPE_SECRET_KEY)


exports.stripeCheckout=async(req,res)=>{
    

    FlightBooking.findById(req.bookingId).exec(async(err,data)=>{
        if(err||!data){
            return res.json({error:true,message:"Wrong booking id"})
        }

        const fares=[
            {
                name:"Base Fare",
                amount:data.base_fare
            },
            {
                name:"Total Tax",
                amount:data.total_tax
            }
        ]

        const session = await stripe.checkout.sessions.create({
            mode:'payment',
            line_items:convert(fares,data.currency),
            payment_intent_data:{
                metadata:{
                    "invoice":String(data._id)
                }
            },
            success_url:`http://localhost:3000/paymentSuccess/${req.bookingId}`,
            cancel_url:"http://localhost:4444/cancel"
        })

        data.stripe_data.checkoutSessionId=session.id;
        data.stripe_data.pay_intentId=session.payment_intent;
    
        data.save((err,data)=>{
            if(err||!data){
                console.log('[+]problem with saving new booking', err);
                return res.status(400).json({err:"Problem with saving new bookings"});
            }
            console.log('[+]Success save',data)
            
            console.log('[+]session url ',session);
            return res.json({error:false,url:session.url,PNR:data.api_pnr})
            })

    })
}


function convert(fares,currency){
    const stripeData=fares.map(e=>{

        return{
            price_data:{
                currency:currency,
                product_data:{
                    name:e.name
                },
                unit_amount:e.amount*100
            },
            quantity:1
        }
    })

    return stripeData
}