const mongoose = require("mongoose")

const PassengerSchema= mongoose.Schema({
    firstName:String,
    lastName:String,
    email:{
        type:String
    },
    mobileNumber:Number,
    subject:String,
    message:String,
    dealName:String
})

module.exports=mongoose.model("FlightBestDealsPassenger",PassengerSchema)