require('dotenv').config()
const stripe=require('stripe')(process.env.STRIPE_SECRET_KEY)

const mongoose = require('mongoose')
const { off } = require('../model/flight_booking')

const FlightBooking=require('../model/flight_booking')
const FlightPassengers=require('../model/flight_passenger')
const FlightSegment = require('../model/flight_segment')


exports.createCheckout=async(req,res)=>{
    //create a entry in the database with data from the request

    const newBooking = new FlightBooking();
    newBooking.user_id=req.userId;
    newBooking.passenger_contact_info.phone_number=req.body.PassengerContactInfo.PhoneNumber;
    newBooking.passenger_contact_info.phone_country_code=req.body.PassengerContactInfo.PhoneCountryCode;
    newBooking.passenger_contact_info.alternate_phone_number=req.body.PassengerContactInfo.AlternatePhoneNumber;
    newBooking.passenger_contact_info.email=req.body.PassengerContactInfo.Email;
    newBooking.target_api='Trip pro';
    newBooking.currency=req.body.Currency;

    const flightData=getFlightData("aa","dd");

    flightBillData=[
        {   
            passenger_type:"ADULT",
            count:0,
            unit_amount:flightData.FareBreakdown[0]
        },
        {
            passenger_type:"CHILD",
            count:0,
            unit_amount:flightData.FareBreakdown[1]
        },
        {
            passenger_type:"INFANT",
            count:0,
            unit_amount:flightData.FareBreakdown[2]
        }
    ]

    
    for(p of req.body.PassengerDetails){
        if(p.PassengerTypeCode==="ADT"){
            flightBillData[0].count++;
        }
        else if(p.PassengerTypeCode==="CHD"){ 
            flightBillData[1].count++;
        }

        else if(p.PassengerTypeCode==="INF"){
            flightBillData[2].count++;
        }

        const newpassenger= await createNewPassenger(p);
        newBooking.flight_passenger_id.push(newpassenger._id);
    }

    const itenary=flightData.Itinerary[0].OriginDestination
    
    for(p in itenary){
        const  newFlightSegment =await createFlightSegment(itenary[p]);
        newBooking.flight_segments.push(newFlightSegment._id)
    }
    
    newBooking.setFare(flightBillData);
    
    console.log('[+]New Booking',newBooking);
    


    stripe.checkout.sessions.create({
        mode:'payment',
            line_items:convert(flightBillData,newBooking.currency),
            payment_intent_data:{
                metadata:{
                    "invoice":String(newBooking._id),
                },
            },
            success_url:`http://localhost:6030/api/FlightDetials/${newBooking._id}`, 
            cancel_url:"http://localhost:4444/suc"
        }).then((session)=>{
            //once we ge the session store the pay intent in the database
            //update the payment status
            //update the booking status
            newBooking.stripe_data.checkoutSessionId=session.id;
            newBooking.stripe_data.pay_intentId=session.payment_intent;
            newBooking.save((err,data)=>{
                if(err||!data){
                    console.log('[+]problem with saving new booking', err);
                    return res.status(400).json({err:"Problem with saving new bookings"});
                }
                console.log('[+]Success save',data)
                
                console.log('[+]session url ',session);
                return res.json({url:session.url})
            })
    }).catch((err)=>{
        console.log('[+]Error from creating stripe checkout session')
        console.error('\x1b[31m','[+]Error type ',err.raw.type);
        console.error('\x1b[31m','[+]Error message '+err.raw.message);
        return res.status(200).json({"error":err.raw.message})
    })

}


function convert(flightBillData,currency){


    const stripeDate=flightBillData.map(e=>{
        if(e.count>0){
        return{
                price_data:{
                    currency:currency,
                    product_data:{
                        name:e.passenger_type
                    },
                    unit_amount:e.unit_amount.GrossFare*100
                },
                quantity:e.count
            }
    }})
    console.log('[+]Stripe data ',stripeDate)
   return stripeDate

   
}


//reaches trip pro and make sure the seats are available for all of them
//stores the charge in the db
/** It returns the complete price for a itenary and could be charged from the user */
// function reprice(itinearyId,adultCount,childCount,infantCount){



function getFlightData(itenaryId,searchId){
    const flightData={
        "Success": true,
        "SearchID": "BdMwhq8Q2BKAGZwlCAAAAA",
        "SearchResult": [
            {
                "Itinerary": [
                    {
                        "JourneyInfo": {
                            "TotalTravelDurationInMinutes": "0D 16H 30M",
                            "NoOfStop": 1
                        },
                        "OriginDestination": [
                            {
                                "AirSegment_Key": "BdMwhq8Q2BKAHZwlCAAAAA==",
                                "Group": 0,
                                "Carrier": "QF",
                                "FlightNumber": 630,
                                "OriginCode": "AVV",
                                "OriginAirportName": "Melbourne",
                                "DestinationCode": "OOL",
                                "DestinationAirportName": "Gold Coast",
                                "DepartureTime": "2022-07-25T16:05:00",
                                "ArrivalTime": "2022-07-25T18:05:00",
                                "TravelDurationInMinutes": 120,
                                "Distance": 0,
                                "LayoverTimeInMinutes": "",
                                "AvailabilitySource": "A",
                                "OperatingCarrier": "JQ",
                                "OperatingFlightNumber": 630,
                                "OriginTerminal": null,
                                "DestinationTerminal": null,
                                "BookingClass": "K",
                                "BookingCount": 9,
                                "CabinClass": "E",
                                "FareBasis": "KLOW",
                                "AirBaggageAllowance": "",
                                "Equipment": "Airbus A320"
                            },
                            {
                                "AirSegment_Key": "BdMwhq8Q2BKAHZwlCAAAAA==",
                                "Group": 0,
                                "Carrier": "QF",
                                "FlightNumber": 591,
                                "OriginCode": "OOL",
                                "OriginAirportName": "Gold Coast",
                                "DestinationCode": "SYD",
                                "DestinationAirportName": "Sydney",
                                "DepartureTime": "2022-07-26T07:05:00",
                                "ArrivalTime": "2022-07-26T08:35:00",
                                "TravelDurationInMinutes": 90,
                                "Distance": 0,
                                "LayoverTimeInMinutes": "13H 0M",
                                "AvailabilitySource": "A",
                                "OperatingCarrier": "QF",
                                "OperatingFlightNumber": 591,
                                "OriginTerminal": null,
                                "DestinationTerminal": null,
                                "BookingClass": "V",
                                "BookingCount": 9,
                                "CabinClass": "E",
                                "FareBasis": "VDQW",
                                "AirBaggageAllowance": "",
                                "Equipment": "Boeing 73H"
                            }
                        ]
                    }
                ],
                "FareBreakdown": [
                    {
                        "PassengerType": "ADT",
                        "BaseFare": 270,
                        "TotalTax": 20,
                        "GrossFare": 290,
                        "Discount": null,
                        "Markup": null,
                        "InvoiceFare": 290,
                        "OtherServiceCharge": null
                    },
                    {
                        "PassengerType": "CHD",
                        "BaseFare": 270,
                        "TotalTax": 20,
                        "GrossFare": 290,
                        "Discount": null,
                        "Markup": null,
                        "InvoiceFare": 290,
                        "OtherServiceCharge": null
                    },
                    {
                        "PassengerType": "INF",
                        "BaseFare": 29,
                        "TotalTax": 0,
                        "GrossFare": 29,
                        "Discount": null,
                        "Markup": null,
                        "InvoiceFare": 29,
                        "OtherServiceCharge": null
                    }
                ],
                "IteneraryRefID": "c9e5a8321bbc4505b55635d01a13d14c",
                "FareType": "PUB",
                "BasePrice": 569,
                "TotalTax": 40,
                "GrossFare": 609,
                "Discount": null,
                "Markup": null,
                "InvoiceFare": 609
            },
            {
                "Itinerary": [
                    {
                        "JourneyInfo": {
                            "TotalTravelDurationInMinutes": "0D 20H 35M",
                            "NoOfStop": 1
                        },
                        "OriginDestination": [
                            {
                                "AirSegment_Key": "BdMwhq8Q2BKAHZwlCAAAAA==",
                                "Group": 0,
                                "Carrier": "QF",
                                "FlightNumber": 630,
                                "OriginCode": "AVV",
                                "OriginAirportName": "Melbourne",
                                "DestinationCode": "OOL",
                                "DestinationAirportName": "Gold Coast",
                                "DepartureTime": "2022-07-25T16:05:00",
                                "ArrivalTime": "2022-07-25T18:05:00",
                                "TravelDurationInMinutes": 120,
                                "Distance": 0,
                                "LayoverTimeInMinutes": "",
                                "AvailabilitySource": "A",
                                "OperatingCarrier": "JQ",
                                "OperatingFlightNumber": 630,
                                "OriginTerminal": null,
                                "DestinationTerminal": null,
                                "BookingClass": "K",
                                "BookingCount": 9,
                                "CabinClass": "E",
                                "FareBasis": "KLOW",
                                "AirBaggageAllowance": "",
                                "Equipment": "Airbus A320"
                            },
                            {
                                "AirSegment_Key": "BdMwhq8Q2BKAHZwlCAAAAA==",
                                "Group": 0,
                                "Carrier": "QF",
                                "FlightNumber": 1783,
                                "OriginCode": "OOL",
                                "OriginAirportName": "Gold Coast",
                                "DestinationCode": "SYD",
                                "DestinationAirportName": "Sydney",
                                "DepartureTime": "2022-07-26T11:10:00",
                                "ArrivalTime": "2022-07-26T12:40:00",
                                "TravelDurationInMinutes": 90,
                                "Distance": 0,
                                "LayoverTimeInMinutes": "17H 5M",
                                "AvailabilitySource": "A",
                                "OperatingCarrier": "QF",
                                "OperatingFlightNumber": 1783,
                                "OriginTerminal": null,
                                "DestinationTerminal": null,
                                "BookingClass": "L",
                                "BookingCount": 9,
                                "CabinClass": "E",
                                "FareBasis": "LDQW",
                                "AirBaggageAllowance": "",
                                "Equipment": "Boeing 717"
                            }
                        ]
                    }
                ],
                "FareBreakdown": [
                    {
                        "PassengerType": "ADT",
                        "BaseFare": 292,
                        "TotalTax": 20,
                        "GrossFare": 312,
                        "Discount": null,
                        "Markup": null,
                        "InvoiceFare": 312,
                        "OtherServiceCharge": null
                    },
                    {
                        "PassengerType": "CHD",
                        "BaseFare": 292,
                        "TotalTax": 20,
                        "GrossFare": 312,
                        "Discount": null,
                        "Markup": null,
                        "InvoiceFare": 312,
                        "OtherServiceCharge": null
                    },
                    {
                        "PassengerType": "INF",
                        "BaseFare": 29,
                        "TotalTax": 0,
                        "GrossFare": 29,
                        "Discount": null,
                        "Markup": null,
                        "InvoiceFare": 29,
                        "OtherServiceCharge": null
                    }
                ],
                "IteneraryRefID": "8928dece27a14148b150a489abb67f90",
                "FareType": "PUB",
                "BasePrice": 613,
                "TotalTax": 40,
                "GrossFare": 653,
                "Discount": null,
                "Markup": null,
                "InvoiceFare": 653
            },
            {
                "Itinerary": [
                    {
                        "JourneyInfo": {
                            "TotalTravelDurationInMinutes": "0D 16H 30M",
                            "NoOfStop": 1
                        },
                        "OriginDestination": [
                            {
                                "AirSegment_Key": "BdMwhq8Q2BKAHZwlCAAAAA==",
                                "Group": 0,
                                "Carrier": "QF",
                                "FlightNumber": 630,
                                "OriginCode": "AVV",
                                "OriginAirportName": "Melbourne",
                                "DestinationCode": "OOL",
                                "DestinationAirportName": "Gold Coast",
                                "DepartureTime": "2022-07-25T16:05:00",
                                "ArrivalTime": "2022-07-25T18:05:00",
                                "TravelDurationInMinutes": 120,
                                "Distance": 0,
                                "LayoverTimeInMinutes": "",
                                "AvailabilitySource": "A",
                                "OperatingCarrier": "JQ",
                                "OperatingFlightNumber": 630,
                                "OriginTerminal": null,
                                "DestinationTerminal": null,
                                "BookingClass": "K",
                                "BookingCount": 9,
                                "CabinClass": "E",
                                "FareBasis": "KLOW",
                                "AirBaggageAllowance": "",
                                "Equipment": "Airbus A320"
                            },
                            {
                                "AirSegment_Key": "BdMwhq8Q2BKAHZwlCAAAAA==",
                                "Group": 0,
                                "Carrier": "QF",
                                "FlightNumber": 591,
                                "OriginCode": "OOL",
                                "OriginAirportName": "Gold Coast",
                                "DestinationCode": "SYD",
                                "DestinationAirportName": "Sydney",
                                "DepartureTime": "2022-07-26T07:05:00",
                                "ArrivalTime": "2022-07-26T08:35:00",
                                "TravelDurationInMinutes": 90,
                                "Distance": 0,
                                "LayoverTimeInMinutes": "13H 0M",
                                "AvailabilitySource": "A",
                                "OperatingCarrier": "QF",
                                "OperatingFlightNumber": 591,
                                "OriginTerminal": null,
                                "DestinationTerminal": null,
                                "BookingClass": "V",
                                "BookingCount": 9,
                                "CabinClass": "E",
                                "FareBasis": "VDQW",
                                "AirBaggageAllowance": "",
                                "Equipment": "Boeing 73H"
                            }
                        ]
                    }
                ],
                "FareBreakdown": [
                    {
                        "PassengerType": "ADT",
                        "BaseFare": 269,
                        "TotalTax": 20,
                        "GrossFare": 289,
                        "Discount": null,
                        "Markup": null,
                        "InvoiceFare": 289,
                        "OtherServiceCharge": null
                    },
                    {
                        "PassengerType": "CHD",
                        "BaseFare": 269,
                        "TotalTax": 20,
                        "GrossFare": 289,
                        "Discount": null,
                        "Markup": null,
                        "InvoiceFare": 289,
                        "OtherServiceCharge": null
                    },
                    {
                        "PassengerType": "INF",
                        "BaseFare": 29,
                        "TotalTax": 0,
                        "GrossFare": 29,
                        "Discount": null,
                        "Markup": null,
                        "InvoiceFare": 29,
                        "OtherServiceCharge": null
                    }
                ],
                "IteneraryRefID": "82ed28de0dd44515a32e8cdf613d0ba9",
                "FareType": "PUB",
                "BasePrice": 567,
                "TotalTax": 40,
                "GrossFare": 607,
                "Discount": null,
                "Markup": null,
                "InvoiceFare": 607
            }
        ]
    }
    return(
        flightData.SearchResult[0]
    )
}

async function createNewPassenger(e){
    const newpassenger=new FlightPassengers();
    newpassenger.gender=e.Gender
    newpassenger.passenger_type=e.PassengerTypeCode
    newpassenger.prefix=e.Title
    newpassenger.firstName=e.FirstName
    newpassenger.lastName=e.LastName
    newpassenger.dateOfBirth=e.DOB
    newpassenger.nationality=e.Nationality
    newpassenger.passport_no=e.PassportNumber
    newpassenger.passport_expiry_date=e.PassportExpiryDate
    newpassenger.passport_issuance_country=e.PassengerIssueCountry
    newpassenger.seat_preferrence=e.Seat
    newpassenger.frequent_flyer_number=e.FrequentFlyerNumber
    newpassenger.meal_request=e.MealCode
    newpassenger.is_wheel_chair=e.IsWheelchair
    return await newpassenger.save();
}

async function createFlightSegment(e){
    // console.log('[+]Flight segment ',e)
    const newFlightSegment= new FlightSegment()
    
    newFlightSegment.origin_code=e.OriginCode
    newFlightSegment.destination_code=e.DestinationCode
    newFlightSegment.departure_dateTime=e.DepartureTime
    newFlightSegment.arrival_dateTime=e.ArrivalTime
    newFlightSegment.operating_airline_code=e.OperatingCarrier
    newFlightSegment.farebasis=e.FareBasis
    newFlightSegment.bookingClass=e.BookingClass
    newFlightSegment.flight_number=e.FlightNumber
    newFlightSegment.origin_airport_name=e.OriginAirportName
    newFlightSegment.destination_airport_name=e.DestinationAirportName

    return await newFlightSegment.save()
}