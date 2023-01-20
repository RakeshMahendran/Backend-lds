const hotelBooking = require("../models/BookingModelHotel")
const Transaction = require('../../flight/model/transaction')
const HotelDetails = require("../models/HotelDetailsModel")
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
                let transactionId = docs.transaction
                let transaction = await Transaction.findById(transactionId)
                let hotelCode = docs.code
                let hotelInfo = await HotelDetails.findOne({code: hotelCode})
                console.log("Result : ", docs);
                booking_data = docs
                res.json({
                    error: false,
                    bookingData: booking_data,
                    transaction_data : transaction,
                    hotelDetails: hotelInfo
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