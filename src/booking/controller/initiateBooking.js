const FlightBooking= require('../model/flight_booking')

const fetch = require('node-fetch')

const stripe=require('stripe')(process.env.STRIPE_SECRET_KEY)



exports.initiateBooking=async (req,res)=>{
    console.log('[+] initate booking request',req.bookingId)
    FlightBooking.findById(req.bookingId).populate('flight_passenger_id').exec((err,data)=>{
        if(err){
            console.log('[+]error ',err)
            return res.status(400).send("wrong booking id")
        }
        stripe.paymentIntents.retrieve(data.stripe_data.pay_intentId).then(async (c)=>{
            if(c.status==="succeeded"){
                // book()
                console.log('[+]')
                const bookingRequest=createBookingRequest(data.flight_passenger_id,data.passenger_contact_info,data.target_api)
                console.log('[+] created booking request body ',bookingRequest)
                const url="https://map.trippro.com/resources/v2/Flights/bookItinerary"
                const headers={
                    "Content-type":"application/json",
                    "AccessToken":process.env.TRIPPRO_ACCESSTOKEN
                }
                fetch(url,{
                    method:"POST",
                    headers:headers,
                    body:JSON.stringify(bookingRequest)
                }).then(res=>res.json()).then(res=>{console.log('[+]Booking response ',res)})

                
            }
            else{
                console.log('[+] payment status ',c.status)
            }

        })
    })


}



function createBookingRequest(flight_passenger,passenger_contact,itinearyId){
    const bookingRequest={
        "ItineraryId": itinearyId,
        "BookItineraryPaxDetail":flight_passenger.map((e)=>{
            return {
                "PaxType":e.passenger_type,
                "Gender": e.gender[0],
                "UserTitle": e.prefix,
                "FirstName": e.firstName,
                "MiddleName": "",
                "LastName": e.lastName,
                "DateOfBirth": `${e.dateOfBirth.getMonth()}/${e.dateOfBirth.getDate()}/${e.dateOfBirth.getFullYear()}`,
                "PassportNumber": e.passport_no,
                "CountryOfIssue":e.passport_issuance_country,
                "Nationality":e.nationality,
                "PassportIssueDate":"",
                "PassportExpiryDate":`${e.passport_expiry_date.getMonth()}/${e.passport_expiry_date.getDate()}/${e.passport_expiry_date.getFullYear()}`
            }
        }),
        "BookItineraryPaxContactInfo": {
        "PhoneNumber": passenger_contact.phone_number,
        "AlternatePhoneNumber": passenger_contact.alternate_phone_number,
        "Email": passenger_contact.email
        },
        "BookItineraryPaymentDetail":{
           "PaymentType": "HOLD",
        
        }
        }

        return bookingRequest
}