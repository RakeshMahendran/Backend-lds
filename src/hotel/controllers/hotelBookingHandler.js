const HotelBooking= require('../models/BookingModelHotel')
const axios=require('axios')

const hotelBookingHandler =async(bookingId)=>{
    let booking_data
    try {

        HotelBooking.findById(bookingId, async function (err,docs){
        if (err){
            console.log(err);
        }
        else{
            console.log("Result : ", docs);
            booking_data = docs
            const rooms = booking_data.rooms.map((s)=>{
                return {
                "rateKey" : s.rates.rateKey,
                "paxes" : booking_data.paxes,

                }
            })
            // MAINLY SAVE BOOKING REFERENCE
            console.log("For booking[+]");
            let req_body = {
            "holder" :  {
                "name" : booking_data.name.firstName,
                "surname" : booking_data.name.lastName
            },
            "clientReference" : "IntegrationAgency",
            "tolerance" : 2, // percentage of price Change to accept,
            "rooms" : rooms,
            // "paymentData": {
            //     "paymentCard": {
            //         "cardHolderName": "CardHolderName",
            //         "cardType": "VI",
            //         "cardNumber": "4444333322221111",
            //         "expiryDate": "0320",
            //         "cardCVC": "123"
            //     },
            //     "contactData": {
            //         "email": "integration@hotelbeds.com",
            //         "phoneNumber": "654654654"
            //     },
            // }
        }
            console.log("hotel webHook activated.....",req_body);
            // const hotelBookingResponse = await axios.post(`http:localhost:6031/api/v1/hotel/booking`,req_body)
            const hotelBookingResponse = await axios.post(`${process.env.CUSTOMERSERVICE}/api/v1/hotel/booking`,req_body)
            booking_data.payment_status = "paid"
            console.log(hotelBookingResponse);

            if (hotelBookingResponse.data.error == false && hotelBookingResponse.booking){
                
                booking_data.booking_status = "confirmed",
                booking_data.booking_reference = hotelBookingResponse.booking.reference ,
                booking_data.clientReference = hotelBookingResponse.booking.clientReference
                await booking_data.save()
            }else{
                console.log("Error in HotelBookingHandler")
                console.log(hotelBookingResponse.data);
                booking_data.booking_status = "failed"
                await booking_data.save()
            }
        }
        }
        )
    }
        

            catch(error){
                console.log("error at hotel Booking Response:",error.message);
            }
}

module.exports = {hotelBookingHandler}