const fetch= require('node-fetch')
//Models

const FlightBooking=require('../model/flight_booking')
const FlightPassengers=require('../model/flight_passenger')
const FlightSegment = require('../model/flight_segment')
const Journey = require('../model/flight_journey')

const {User} = require('../../users/models/userModel')

async function request (body){
    console.log('[+]Body to gen pnr',body)
    const url=`${process.env.CUSTOMERSERVICE}/api/v1/flight/generatePNR`;
    
    const headers={
        "Content-Type":"application/json",
        "Access_token":"abcd"
    }

    let bookingResponse =await fetch(url,{
        method:'POST',
        headers:headers,
        body:JSON.stringify(body)
    })

    return bookingResponse.json()

}

exports.generatePNR=async(req,res,next)=>{
  
    console.log('[+]Generating pnr...')
    let booking = FlightBooking.findById(req.bookingId)
    booking = await booking.populate('flight_passenger_id').populate({path:'flight_journey',populate:{path:'journey_segments',model:'FlightSegment'}})



    let body={
        flight_passenger_id:booking.flight_passenger_id,
        passenger_contact_info:booking.passenger_contact_info,
        target_api:booking.target_api,
        seat:false,
    }

    if(booking.seat_charge_total_fare!==undefined){
        body.seat=true
        body.journey=booking.flight_journey
    }
   
    const bookingResponse=await  request(body)

    console.log('[+]Booking response ',bookingResponse)
    

    booking.api_pnr=bookingResponse.api_pnr
    booking.api_refNum=bookingResponse.api_refNum

    booking.booking_status="PNR";
    console.log('[+]Pnr generated...')
    await  booking.save()

    // const flightSummary = await (await data.).populate('user_id')

    const flightSummary = await (await (await booking.populate({path:'flight_journey',populate:{path:'journey_segments',model:'FlightSegment'}})).populate('user_id')).populate('flight_passenger_id')
    console.log('[+]FLight summary ',flightSummary)
    
    next()
}



