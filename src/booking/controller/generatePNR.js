const fetch= require('node-fetch')


//Models

const FlightBooking=require('../model/flight_booking')
const FlightPassengers=require('../model/flight_passenger')
const FlightSegment = require('../model/flight_segment')
const Journey = require('../model/flight_journey')




const {User} = require('../../users/models/userModel')



exports.generatePNR=async(req,res,next)=>{
  
    console.log('[+]Generating pnr...')
    let booking = FlightBooking.findById(req.bookingId)
    booking = await booking.populate('flight_passenger_id')

    const bookingRequest= createBookingRequest(booking.flight_passenger_id,booking.passenger_contact_info,booking.target_api)
    const bookingResponse=await bookItinerary(bookingRequest);
    
    if(bookingResponse.ErrorCode!==undefined){
        return res.json({
            error:true,
            message:bookingResponse.ErrorText,
            bookingId:req.bookingId
        })
    }
    
    booking.api_pnr=bookingResponse.PNR;
    booking.api_refNum=bookingResponse.ReferenceNumber
    booking.booking_status="PNR";
    console.log('[+]Pnr generated...')
    console.log('[+]Pnr response ',bookingResponse)
    await  booking.save()

    // const flightSummary = await (await data.).populate('user_id')

    const flightSummary = await (await (await booking.populate({path:'flight_journey',populate:{path:'journey_segments',model:'FlightSegment'}})).populate('user_id')).populate('flight_passenger_id')
    console.log('[+]FLight summary ',flightSummary)
    
    next()
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
        "PhoneNumber": String(passenger_contact.phone_number),
        "AlternatePhoneNumber": String(passenger_contact.alternate_phone_number),
        "Email": String(passenger_contact.email)
        },
        "BookItineraryPaymentDetail":{
           "PaymentType": "HOLD",
        
        }
        }

        return bookingRequest
}

bookItinerary=async(bookingRequest)=>{

    const url="https://map.trippro.com/resources/v2/Flights/bookItinerary"
    const headers={
        "Content-type":"application/json",
        "AccessToken":process.env.TRIPPRO_ACCESSTOKEN
    }
    const response = await fetch(url,{
        method:"POST",
        headers:headers,
        body:JSON.stringify(bookingRequest)
    })
    return response.json()
}

