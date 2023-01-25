const hotelBooking = require("../models/BookingModelHotel")
const Transaction = require('../../flight/model/transaction')
const HotelDetails = require("../models/HotelDetailsModel")
const axios=require('axios')


const filterBookingResponse= (data,bookingId,transaction,hotelInfo) =>{
    return ({
        bookingData:data &&{
            name:data.name && {
                firstName:data.name.firstName,
                lastName: data.name.lastName
            },
            bookingId : bookingId,//c
            rooms : data.rooms,
            paxes: data.paxes,
            // paxes: data.rooms.map(s=>{
            //     return s.paxes
            // }),
            code : data.code,
            booking_status : data.booking_status,
            // payment_method : "AT_WEB", //need to change !!!!
            checkInDate : data.checkInDate,
            checkOutDate : data.checkOutDate,
            // bookedDate : data.creationDate,
            clientReference : data.clientReference,
            createdAt : data.createdAt,
            updatedAt : data.updatedAt,

        },
        hotelData : hotelInfo, 
        transaction_data : {  //need to change to transactionData
            card : transaction.card,
            paymentStatus : transaction.status,
            amountCharged : transaction.amountCharged,
            currency : transaction.currency,
            receiptURI : transaction.receiptURI
        }

    })
}



exports.sucessPaymentHotel = async(req,res,next) =>{
    try{
        let bookingId =req.body.bookingId
        const HotelBooking =await hotelBooking.findById(bookingId)
        try{
            let transactionId = HotelBooking.transaction
            let transaction = await Transaction.findById(transactionId)
            let hotelCode = HotelBooking.code
            let hotelInfo = await HotelDetails.findOne({code: hotelCode})
            const filterResponse = filterBookingResponse(HotelBooking,bookingId,transaction,hotelInfo)
            res.json({
                error: false,
                bookingData:filterResponse.bookingData,
                hotelDetails:filterResponse.hotelData,
                transaction_data:filterResponse.transaction_data,
                // data: final
            })
        }catch(err){
            res.json({
                error:true,
                message: err.message
            })
        }
    //     hotelBooking.findById(bookingId, async function (err,docs){
    //         if (err){
    //             console.log(err);
    //         }
    //         else{
    //             let transactionId = docs.transaction
    //             let transaction = await Transaction.findById(transactionId)
    //             let hotelCode = docs.code
    //             let hotelInfo = await HotelDetails.findOne({code: hotelCode})
    //             console.log("Result : ", docs);
    //             booking_data = docs
    //             res.json({
    //                 error: false,
    //                 bookingData: booking_data,
    //                 transaction_data : transaction,
    //                 hotelDetails: hotelInfo
    //             })
    //         }
    //     })
    }
    catch (error) {
        res.json({
            error:true,
            message: error.message,
            file: "sucessPaymentHotel.js"
        })
    }
}