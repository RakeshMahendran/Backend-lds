const hotelBooking = require("../models/BookingModelHotel")
const HotelDetails = require("../models/HotelDetailsModel")
const Transaction = require("../../flight/model/transaction")
const axios=require('axios')

const canceljson = require("../../../../cancellation1.json")



const filterCancelResponse= (data,bookingId,transaction,hotelInfo) =>{
    return ({
        bookingData:data.hotel &&{
            name:data.holder && {
                firstName:data.holder.name,
                lastName: data.holder.surname
            },
            bookingId : bookingId,//c
            rooms : data.hotel.rooms,
            paxes: data.hotel.rooms.map(s=>{
                return s.paxes
            }),
            code : data.hotel.code,
            booking_status : data.status,
            // payment_method : "AT_WEB", //need to change !!!!
            checkInDate : data.hotel.checkIn,
            checkOutDate : data.hotel.checkOut,
            bookedDate : data.creationDate,
            clientReference : data.clientReference,

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

exports.cancelRequest = async(req,res,next)=>{
    try{
        const bookingId = req.body.bookingId
        // var transaction = {}
        const HotelBooking =await hotelBooking.findById(bookingId)
        // hotelBooking.findById(bookingId,async function(err,docs){
            // if(err){
            //     console.log("error in hotelBooking modal at cancelRequest hotel file",err);
            // }else {
                try{
                    const bookingReference = HotelBooking.booking_reference
                    const transactionId = HotelBooking.transaction
                    if (!bookingReference){
                        throw Error("BookingReference is undefined.")
                    }else{
                                let transaction = await Transaction.findById(transactionId)
                                let hotelCode = HotelBooking.code
                                let hotelInfo = await HotelDetails.findOne({code: hotelCode})
                                // console.log(transaction);
                                let data = {
                                    "bookingReference": bookingReference
                                }
                                const cancelResponse = axios.post(`${process.env.CUSTOMERSERVICE}/api/v1/hotel/cancel`,data)
                                let final;
                                await cancelResponse.then().then(val=>{
                                    // console.log(val)
                                    final=val;    
                                })
                                
                                // FOR DEMO DATA
                                // let final = canceljson.booking
                                if (final.data.error == true){
                                    res.json(final.data)
                                }else{
                                    HotelBooking.booking_status = "canceled"
                                    console.log(final.data.Results.cancellationReference);
                                    HotelBooking.cancellationReference = final.data.Results.cancellationReference
                                    console.log(HotelBooking.cancellationReference);
                                    await HotelBooking.save()
                                    console.log("cancel response filter started ..");
                                    console.log(final.data);
                                    const filterResponse = filterCancelResponse(final.data.Results,bookingId,transaction,hotelInfo)
                                    console.log("filter ended");
                                    
                                    res.json(filterResponse)
                                    // res.json({
                                    //     error: false,
                                    //     final :filterResponse,
                                    //     // data: final
                                    // })
                                }
        
        
        
        
                            }
                }catch(err){
                    res.json({
                        error:true,
                        message: err.message
                    })
                }
            // }
        // }
        // )

    }catch(error){
        res.json({
            error: true,
            message: error.message
        })
    }
}