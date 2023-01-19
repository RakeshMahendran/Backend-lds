const Transaction = require('../flight/model/transaction')
const FlightBooking= require('../flight/model/flight_booking')
const HotelBooking= require('../hotel/models/BookingModelHotel')

const {ticketing}= require("../flight/controller/ticketing")
const { default: axios } = require('axios')
const { data } = require('jquery')

exports.webhookManager=async(req,res)=>{
    try{

        let type=req.body.type
        
        console.log('[+]payintent sucess ===> metadata ',req.body.data.object.metadata)
        let bookingId=req.body.data.object.metadata.bookingId
        let transactionId= req.body.data.object.metadata.invoice
        let service= req.body.data.object.metadata.serviceType
        switch(type){
            case "payment_intent.created":
                console.log('[+]Payintent created for ',service,'service ...')
                break;
    
            case "payment_intent.succeeded":
                let transaction = await Transaction.findById(transactionId)
                if(transaction) {
                    transaction.status = "paid"
        
                    //updates the transaction from the dets of the webhook of payment success

                    transaction = updateCharges(req.body.data.object.charges.data[0], transaction)
                    await transaction.save()
                }
                else{
                res.status(200)
                    res.send("The transaction id is not found in the db")
                    return
                }
                console.log(`[=]payment succeeded for service ${service}...`)
                switch(service){
                    case "flights":{
                        FlightBooking.findById(bookingId).exec(async(err,data)=>{
                            if(err||!data){
                                console.log('[+]Unable to find the data for the particular id')
                                return
                            }
                            data.payment_status="paid"
                            /********* Initiate the ticketing once the payment is done ********/
                
                            if(data.booking_status==="PNR"){
                                data.booking_status="ticketing"
                                //ticketing(data).then(d=>{
                                    // console.log("[+]",d)
                
                                        /* once the ticketing is done and successfull */
                                        let t= new Date()
                                        t.setSeconds(t.getSeconds()+(24*60*60))
                                        data.cancelTimeLimit=t
                                //})
                            }
                            await data.save();
                            console.log('[+]Flight saved ',data)
                            console.log('[+]Transaction ',transaction)                      
                        })
                    }
                        break;
                    case "hotels":{
                        console.log("Hotel webhook");

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
                                "paymentData": {
                                    "paymentCard": {
                                        "cardHolderName": "CardHolderName",
                                        "cardType": "VI",
                                        "cardNumber": "4444333322221111",
                                        "expiryDate": "0320",
                                        "cardCVC": "123"
                                    },
                                    "contactData": {
                                        "email": "integration@hotelbeds.com",
                                        "phoneNumber": "654654654"
                                    },
                                }}
                                console.log("hotel webHook activated.....",req_body);
                                // const hotelBookingResponse = await axios.post(`http:localhost:6031/api/v1/hotel/booking`,req_body)
                                const hotelBookingResponse = await axios.post(`${process.env.CUSTOMERSERVICE}/api/v1/hotel/booking`,req_body)

                                if (hotelBookingResponse.data.error == false){
                                    
                                    booking_data.booking_status = "confirmed",
                                    booking_data.booking_reference = hotelBookingResponse.booking.reference ,
                                    booking_data.clientReference = hotelBookingResponse.booking.clientReference
                                }else{
                                    console.log("Error in webhookManager(hotel)")
                                    console.log(hotelBookingResponse.data);
                                    booking_data.booking_status = "failed"
                                }
                            }
                            }
                            )
                        }
                            

                                catch(error){
                                    console.log("error at hotel Booking Response:",error.message);
                                }

                    }
                        break;
                    
                    case "cab":{
    
                    }
                        break;
                }
                break;
            case "payment_intent.requires_action":
                console.log('[+]This payment need action')
                break;
        }
    
        res.status(200)
        res.send()
    }catch(error){
        console.log(error.message)
        res.json({
            error:true,
            message: error.message,
            file: "webhookManager.js"
        })
    }

}


function updateCharges(charge,transaction){
    //retrive charge with charge id

    let card = charge.payment_method_details
    console.log('[+]Card dets ',card)
    transaction.chargeId=charge.id
    transaction.card.last4=card.card.last4
    transaction.card.brand=card.card.brand
    transaction.card.expMonth=card.card.exp_month
    transaction.card.expYear=card.card.exp_year
    transaction.receiptURI=charge.receipt_url
    transaction.amountCharged=charge.amount_captured/100
    transaction.currency=charge.currency
    transaction.countryOfPayment=charge.billing_details.address.countryOfPayment

    return transaction
}