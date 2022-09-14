const fetch = require('node-fetch')

const FlightBooking = requier('../model/flight_booking')

exports.ticketing= async (req,res)=>{
    const flight = await FlightBooking.findById(req.bookingdId)
    if(flight.payment_status==="paid"){
        
    }
}