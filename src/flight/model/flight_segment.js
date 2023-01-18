const mongoose = require('mongoose');


const flightSegmentSchema=new mongoose.Schema({
    origin_code:{
        type:String
    },
    destination_code:{
        type:String
    },
    
    departure_dateTime:{
        type:Date
    },
    arrival_dateTime:{
        type:Date
    },
    operating_airline_code:{
        type:String,
    },
    farebasis:{
        type:String,
    },
    bookingClass:{
        type:String,
    },
    baggage:{
        type:String,
    },
    flight_number:{
        type:Number,
    },
    origin_airport_name:{
        type:String,
    },
    destination_airport_name:{
        type:String
    },
    travel_duration_in_minutes:{
        type:Number
    },


    // previous:{
    //     type:mongoose.Schema.ObjectId,
    //     ref:"FlightSegment"
    // },
    // next:{
    //     type:mongoose.Schema.ObjectId,
    //     ref:"FlightSegment"
    // }
})

module.exports=mongoose.model('FlightSegment',flightSegmentSchema);