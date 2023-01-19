const hotelBooking = require("../models/BookingModelHotel")
// const Transaction = require('../booking/model/transaction')
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
                // let transactionId = docs.transaction
                // let transaction = await Transaction.findById(transactionId)
                console.log("Result : ", docs);
                booking_data = docs
                res.json({
                    error: false,
                    data: booking_data,
                    // transaction_data : transaction
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