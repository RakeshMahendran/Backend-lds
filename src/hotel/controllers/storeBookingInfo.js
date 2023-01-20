const hotelBooking = require("../models/BookingModelHotel")
const HotelDetails = require("../models/HotelDetailsModel")
const axios=require('axios')

const {stripeCreate}= require('../../stripe/stripe.create')

exports.storeBookingInfo = async(req,res,next) =>{
    try{
        const newBooking = new hotelBooking()
        newBooking.code = req.body.code
        newBooking.userId = req.userId
        newBooking.booking_status = "init"
        // newBooking.payment_status = "unpaid"
        newBooking.payment_method = req.body.paymentType
        newBooking.rooms = req.body.rooms
        newBooking.paxes = req.body.paxes
        newBooking.name.firstName=req.body.holder.name
        newBooking.name.lastName= req.body.holder.surname

        // console.log('[+]names ',req.body)
        await newBooking.save()
        console.log("saved.......",newBooking);

        HotelDetails.findOne({code:req.body.code}).exec(async (err,data)=>{
            if(err){
                console.log('[+]Error while storing hotel Details in StoreBookingInfo file');
            }
            else if(!data){
                console.log('[+]Creating new hotel')
                const hotel = new HotelDetails();
                hotel.code = req.body.code,
                hotel.name = req.body.name,
                hotel.address = req.body.address,
                hotel.city = req.body.city,
                hotel.ranking = req.body.ranking,
                hotel.rating = req.body.rating,
                hotel.images = req.body.images,
                hotel.facilities = req.body.facilities,
                hotel.phones = req.body.phones
                const newHotel = await hotel.save();
                // req.userId=guestUser._id;
                console.log('[+]New hotel created ',req.body.code)
                
            }
    
            else{
                console.log('[+]Already exsting hotel ')
                // req.userId=data._id
                
            }
        })

        let fares =0
        const markup = 20
        newBooking.rooms.map((s)=>{
            // s.rates.map((single)=>{
                // console.log(single);
                console.log(s.rates);
                fares += parseInt(s.rates.net)
                console.log(fares);
            // })
        })
        let invoice_fare = fares + markup
        invoice_fare = invoice_fare.toFixed(2)

        console.log(invoice_fare);
        
        
        const stripeResponse =await stripeCreate({
            amount:invoice_fare*100,
            bookingId:newBooking._id,
            service:"hotels"
        })
        if(stripeResponse.error){
            throw{
                message:stripeResponse.message
            }
        }

        newBooking.transaction= stripeResponse.transaction_id
        await newBooking.save()

        return res.json({
            error:false,
            paymentIntents:stripeResponse.payintent_client_secret,
            fare:invoice_fare,
            bookingId:newBooking._id
        })

    }
    catch (error) {
        res.json({
            error:true,
            message: error.message,
            file: "storeBookingInfo.js"
        })
    }
}