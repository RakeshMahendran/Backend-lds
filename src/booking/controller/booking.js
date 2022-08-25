const fetch= require('node-fetch')
const stripe = require('stripe').Stripe(process.env.STRIPE_SECRET_KEY)

//Models

const FlightBooking=require('../model/flight_booking')
const FlightPassengers=require('../model/flight_passenger')
const FlightSegment = require('../model/flight_segment')
const Journey= require('../model/flight_journey')

exports.getPrice=async (req,res)=>{
    console.log('[+]Initilizing Trip pro reprice...')
    const p = req.body
    const price=await reprice(req.itineraryId,p.AdultCount,p.ChildCount,p.InfantCount)

    console.log('[+]Reprice ',price)

    if(price.ErrorCode!==undefined){
        return res.json({
            error:true,
            message:price.ErrorText
        })
    }

    res.json({
        error:false,
        Fares:price.Fares
    })

}


const {User} = require('../../users/models/userModel')

exports.guestCheckout = (req,res,next)=>{

    User.findOne({email:req.body.PassengerContactInfo.Email}).exec(async (err,data)=>{
        if(err){
            console.log('[+]Error data form guest user');
        }
        else if(!data){
            const user = new User();
            user.email=req.body.PassengerContactInfo.Email
            user.phoneNo= req.body.PassengerContactInfo.PhoneNumber
            user.countryCode=req.body.PassengerContactInfo.PhoneCountryCode

            const guestUser = await user.save();
            req.userId=guestUser._id;
            next()
        }

        else{
            console.log('[+]Already exsting guest user',data)
            req.userId=data._id
            next()
        }
    })

}

async function reprice(it,a,c,i){

    const body={
        "ItineraryId":String(it),
        "AdultPaxCount":a,
        "ChildPaxCount":c,
        "InfantPaxCount":i
     }

     console.log('[+]Reprice body ',body)

    const headers={
        "Content-Type":"application/json",
        "AccessToken":process.env.TRIPPRO_ACCESSTOKEN
    }

    const url="https://map.trippro.com/resources/api/v3/repriceitinerary";

    const response=await fetch(url,{
        method:"POST",
        headers:headers,
        body:JSON.stringify(body)
    })
    return response.json()

}


exports.generatePNR=async(req,res,next)=>{
    const newBooking = new FlightBooking();

    pci=req.body.PassengerContactInfo;
    newBooking.user_id=req.userId;
    newBooking.passenger_contact_info.phone_number=pci.PhoneNumber;
    newBooking.passenger_contact_info.phone_country_code=pci.PhoneCountryCode;
    newBooking.passenger_contact_info.alternate_phone_number=pci.AlternatePhoneNumber;
    newBooking.passenger_contact_info.email=pci.Email;
    newBooking.target_api=req.body.IteneraryRefID;
    newBooking.currency=req.body.Currency;

    const pass={
        ADT:0,
        CHD:0,
        INF:0
    }

    for(p of req.body.PassengerDetails){
        pass[p.PassengerTypeCode]++;
        const newpassenger= await createNewPassenger(p);
        newBooking.flight_passenger_id.push(newpassenger._id);
    }

    console.log('[+]Passenger type count ',pass)

    let data= await newBooking.populate('flight_passenger_id')

    const bookingRequest= createBookingRequest(data.flight_passenger_id,data.passenger_contact_info,data.target_api)
    const bookingResponse=await bookItinerary(bookingRequest);
    console.log('[+]PNR Booking response ',bookingResponse)

    if(bookingResponse.ErrorCode!==undefined){
        return res.json({
            error:true,
            message:bookingResponse.ErrorText
        })
    }
    
    data.api_pnr=bookingResponse.PNR;

    data = await createFlightSegments(data,pass);
    data=await data.save()
    // const flightSummary = await (await data.).populate('user_id')

    const flightSummary = await (await (await data.populate({path:'flight_journey',populate:{path:'journey_segments',model:'FlightSegment'}})).populate('user_id')).populate('flight_passenger_id')
    console.log('[+]FLight summary ',flightSummary)
    
    // return res.status(200).json({
    //     error:false,
    //     data:bookingResponse,
    //     flightSummary:flightSummary
    // })
    req.bookingId=data._id
    next()
}


exports.stripeCheckout=async(req,res)=>{
    

    FlightBooking.findById(req.bookingId).exec(async(err,data)=>{
        if(err||!data){
            return res.json({error:true,message:"Wrong booking id"})
        }

        const fares=[
            {
                name:"Base Fare",
                amount:data.base_fare
            },
            {
                name:"Total Tax",
                amount:data.total_tax
            }
        ]

        const session = await stripe.checkout.sessions.create({
            mode:'payment',
            line_items:convert(fares,data.currency),
            payment_intent_data:{
                metadata:{
                    "invoice":String(data._id)
                }
            },
            success_url:"http://localhost:6030/api/succcess/",
            cancel_url:"http://localhost:4444/cancel"
        })

        data.stripe_data.checkoutSessionId=session.id;
        data.stripe_data.pay_intentId=session.payment_intent;
    
        data.save((err,data)=>{
            if(err||!data){
                console.log('[+]problem with saving new booking', err);
                return res.status(400).json({err:"Problem with saving new bookings"});
            }
            console.log('[+]Success save',data)
            
            console.log('[+]session url ',session);
            return res.json({error:false,url:session.url,PNR:data.api_pnr})
            })

    })
}


function convert(fares,currency){
    const stripeData=fares.map(e=>{

        return{
            price_data:{
                currency:currency,
                product_data:{
                    name:e.name
                },
                unit_amount:e.amount*100
            },
            quantity:1
        }
    })

    return stripeData
}

async function createNewPassenger(e){
    console.log('[+]Creating New passenger...')
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


async function createFlightSegments(data,pass){
    const itinearyId= data.target_api;
    const flightData= await reprice(itinearyId,pass.ADT,pass.CHD,pass.INF)

    if(flightData.ErrorCode!==undefined){
        return flightData
    }

    const fares = flightData.Fares

    
    console.log('[+]Fares ',flightData)
    

    data.setFare(fares,pass)

    console.log('[+]reprice ',flightData)
    for(f of flightData.Citypairs){
        const newJourney = new Journey()
        for(fs of f.FlightSegment){
            const flightSegment=await newFlightSegment(fs);
            console.log('[+]New flight segment ',flightSegment)
            newJourney.journey_segments.push(flightSegment._id)
        }
        const j=await newJourney.save()
        data.flight_journey.push(j._id)

    }
    

    return data;

}

async function newFlightSegment(e){
    // console.log('[+]Flight segment ',e)
    console.log('[+]Creating new FLight Segment...',e)
    const newFlightSegment= new FlightSegment()
    
    newFlightSegment.origin_code=e.DepartureLocationCode
    newFlightSegment.destination_code=e.ArrivalLocationCode
    newFlightSegment.departure_dateTime=e.DepartureDateTime
    newFlightSegment.arrival_dateTime=e.ArrivalDateTime
    newFlightSegment.operating_airline_code=e.OperatingAirline
    newFlightSegment.farebasis=e.FareBasisCode
    newFlightSegment.bookingClass=e.BookingClass
    newFlightSegment.flight_number=e.FlightNumber
    newFlightSegment.origin_airport_name=e.OriginAirportName
    newFlightSegment.destination_airport_name=e.DestinationAirportName

    return await newFlightSegment.save()
}