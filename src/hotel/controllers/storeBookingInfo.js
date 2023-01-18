const hotelBooking = require("../models/BookingModelHotel")
const axios=require('axios')

exports.storeBookingInfo = async(req,res,next) =>{
    try{
        const newBooking = new hotelBooking()
        newBooking.code = req.body.code
        newBooking.userId = req.userId
        newBooking.booking_status = "init"
        newBooking.payment_status = "unpaid"
        newBooking.payment_method = req.body.paymentType
        newBooking.rooms = req.body.rooms
        newBooking.save()
        console.log("saved.......");
        let fares =0
        const markup = 20
        newBooking.rooms.map((s)=>{
            // s.rates.map((single)=>{
                // console.log(single);
                console.log(s.rates[0]);
                fares += parseInt(s.rates[0].net)
                console.log(fares);
            // })
        })
        let invoice_fare = fares + markup
        invoice_fare = invoice_fare.toFixed(2)

        console.log(invoice_fare);
        // const stripeResponse=await axios.post(`http://52.91.140.13:88/stripe/create`,{
        const stripeResponse=await axios.post(`${process.env.CORESERVICE}/stripe/create`,{
                amount:invoice_fare*100,
                id:req.userId,
                service:'hotels'
            })
            // console.log(stripeResponse);
            if(stripeResponse.data || 1)
            {
                if(stripeResponse.data.error==false || 1)
                {
                    //storing the transaction id into the data
                    newBooking.transaction= stripeResponse.data.transaction_id;
                    await newBooking.save((err,d)=>{
                        console.log('[+]Hotel Booking saved')
                    })

                    if (stripeResponse.data.error == false){
                        return res.json({
                            error:false,
                            paymentIntents:stripeResponse.data.stripe.payment_intent_CLIENT_SECRET,
                            fare:invoice_fare,
                            bookingId:req.bookingId
                        })
                        
                    }else{
                        return res.json({
                            error:true,
                            message:stripeResponse.data.message,
                            fare:invoice_fare,
                            bookingId:req.bookingId
                        })
                        
                    }
                }
            }

    }
    catch (error) {
        res.json({
            error:true,
            message: error.message,
            file: "storeBookingInfo.js"
        })
    }
}