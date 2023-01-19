const hotelBooking = require("../models/BookingModelHotel")
const axios=require('axios')

exports.sucessPaymentHotel = async(req,res,next) =>{
    try{
        let bookingId =req.body.bookingId
        let booking_data
        hotelBooking.findById(bookingId, async function (err,docs){
            if (err){
                console.log(err);
            }
            else{
                console.log("Result : ", docs);
                booking_data = docs
                res.json({
                    error: false,
                    data: booking_data
                })
            }
        })
    }
    catch (error) {
        res.json({
            error:true,
            message: error.message,
            file: "sucessPaymentHotel.js"
        })
    }
}