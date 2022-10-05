const FlightBooking = require('../model/flight_booking')

exports.listFlight = (req,res)=>{
    const q = Object.keys(req.query)
    console.log('[+]Queries ',req.query)
    FlightBooking.find(req.query).populate('flight_passenger_id').populate({path:'flight_journey',populate:{path:'journey_segments',model:'FlightSegment'}}).exec((err,data)=>{
        // console.log('[+]Filtred data ',data)
        res.json(data)
    })
}