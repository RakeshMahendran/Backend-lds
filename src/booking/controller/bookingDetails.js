require('dotenv').config()
const stripe=require('stripe')(process.env.STRIPE_SECRET_KEY)


const FlightBooking=require('../model/flight_booking')

const {ticketing} = require ('./ticketing')

exports.BookingDetails=(req,res,next)=>{
    

    FlightBooking.findById(req.bookingId).populate('flight_passenger_id').populate({path:'flight_journey',populate:{path:'journey_segments',model:'FlightSegment'}}).exec((err,data)=>{
        if(err||!data){
            console.log('[+]unable to locate the booking detials')
            return res.status(400).json({
                error:true,
                message:"Unable to find the booking detials"
            })
        }
       
        req.bookingData=data
        console.log('[+]Booking status ',data.booking_status)
        if(data.booking_status==="ticketing"){
            next()
            return
        }
           
        return res.json({
            error:false,
            data:data
        })
    })
}

async function sucessPayment(res,data1){
    data = await ticketing(data1)
    if(data.ticketingResponse==="TICKET ORDERED SUCCESSFULLY"){
        data.data.booking_status="confirmed"
    }
    else{
        data.data.booking_status="ticketing"
    }
    // console.log('[+]After console log',data)
    data.data.stripe_data.pay_intentId=undefined
    data.data.stripe_data.chargeId=undefined
    data.data.stripe_data.checkoutSessionId=undefined
    // /* start the ticketing */
    await data.data.save()
    console.log('[+]Response from ticketing',data)
    return res.status(200).json({
        error:false,
        message:data
    })
}