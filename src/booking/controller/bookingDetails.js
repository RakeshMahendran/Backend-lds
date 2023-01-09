require('dotenv').config()

const FlightBooking=require('../model/flight_booking')

exports.BookingDetails=(req,res,next)=>{
    

    FlightBooking.findById(req.bookingId).populate('flight_passenger_id').populate('transaction').populate({path:'flight_journey',populate:{path:'journey_segments',model:'FlightSegment'}}).exec((err,data)=>{
        if(err||!data){
            console.log('[+]unable to locate the booking detials')
            return res.status(400).json({
                error:true,
                message:"Unable to find the booking detials"
            })
        }
       
        req.bookingData=data
        console.log('[+]Booking status ',data.booking_status)
        // if(data.booking_status==="ticketing"){
        //     next()
        //     return
        // }
           
        return res.json({
            error:false,
            data:data
        })
    })
}

