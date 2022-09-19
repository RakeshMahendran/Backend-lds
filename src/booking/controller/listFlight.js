
const FlightBooking = require('../model/flight_booking')

exports.listFlight=(req,res)=>{
    FlightBooking.find({user_id:req.userId}).populate('user_id').populate({path:'flight_journey',populate:{path:'journey_segments',model:'FlightSegment'}}).populate("flight_passenger_id").exec((err,data)=>{
        console.log('[+]Booking history ',data)
        return res.json({
            error:false,
            data:data
        })
    })
}