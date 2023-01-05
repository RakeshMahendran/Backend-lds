const mongoose = require('mongoose')

const flight_passenger = mongoose.Schema({
    gender:{
        type:String,
        enum:["male","female","transGender"],
        require:true,
    },
    passenger_type:{
        type:String,
        enum:["ADT","CHD","INF"],
        require:true,

    },
    is_lead_pax:{
        type:Boolean
    },
    prefix:{
        type:String
    },
    firstName:{
        type:String,
        require:true,

    },
    lastName:{
        type:String
    },
    dateOfBirth:{
        type:Date,
        require:true,

    },
    nationality:{
        type:String,
        require:true,

    },
    passport_no:{
        type:String,
        require:true,

    },
    passport_expiry_date:{
        type:Date,
        require:true,

    },
    passport_issuance_country:{
        type:String,
    },
    seat_preferrence:{
        type:Array,
    },
    frequent_flyer_number:{
        type:String
    },
    meal_request:{
        type:String
    },
    base_fare:{
        type:Number,
    },
    total_fare:{
        type:Number
    },
    gross_fare:{
        type:Number
    },
    commission:{
        type:Number
    },
    ait:{
        type:Number
    },
    invoice_fare:{
        type:Number
    },
    is_wheel_chair:{
        type:Boolean
    }
})

module.exports=mongoose.model("FlightPassengers",flight_passenger)