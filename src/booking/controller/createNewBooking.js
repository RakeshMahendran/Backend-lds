const FlightBooking = require('../model/flight_booking')
const FlightJourney = require('../model/flight_journey')
const FlightPassengers = require('../model/flight_passenger')
const FlightSegment = require('../model/flight_segment')

exports.createNewBooking=async(req,res,next)=>{

    const newBooking = new FlightBooking()

    if(req.bookingId!==undefined){
        const booking = await FlightBooking.findById(req.bookingId)
        if(booking === undefined){
            next()
        }
        if(booking.booking_status !=="init"){
            return res.json({
                error:true,
                message:`This booking is been moved to ${booking.booking_status}, so this request is denied`
            })
        }
        console.log('[+] delete this booking ',booking)
        booking.flight_passenger_id.map(async (e)=>{
            await FlightPassengers.deleteOne({_id:e})
        })
        booking.flight_journey.map((e)=>{
            FlightJourney.findById(e).exec((err,journey)=>{
                journey.journey_segments.map(async(e)=>{
                   await FlightSegment.deleteOne({_id:e})
                })
            })
            FlightJourney.deleteOne({_id:e})
        })
        await FlightBooking.deleteOne({_id:req.bookingId})
        // console.log('[+]Delete result ',del)
    }
    const nb =await newBooking.save()
    req.bookingId=nb._id
    console.log('[+]Booking id 2 ',req.bookingId)
    console.log('[+]User id', req.userId)
    // return res.json({
    //     data:newBooking
    // })
    next()
}