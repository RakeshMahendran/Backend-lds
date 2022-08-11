require('dotenv').config()
const stripe=require('stripe')(process.env.STRIPE_SECRET_KEY)

const fetch = require('node-fetch')


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
    newBooking.target_api=req.body.IteneraryRefID;
    newBooking.currency=req.body.Currency;

    
    flightBillData=[
        {   
            passenger_type:"ADULT",
            count:0,
            amount:null
        },
        {
            passenger_type:"CHILD",
            count:0,
            amount:null
        },
        {
            passenger_type:"INFANT",
            count:0,
            amount:null
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
    
    const flightData= await reprice(req.body.IteneraryRefID,flightBillData[0].count,flightBillData[1].count,flightBillData[2].count);
    console.log('[+]reprice res ',flightData)

    if(flightData.ErrorCode!==undefined){
        return res.status(200).json(flightData)
    }


    flightBillData[0].amount=flightData.Fares[0]
    flightBillData[1].amount=flightData.Fares[1]
    flightBillData[2].amount=flightData.Fares[2]

    console.log('[+]Flight bill data',flightBillData)

    const itenary= await flightData.Citypairs[0].FlightSegment;
    
    for(p in itenary){
        const  newFlightSegment = await createFlightSegment(itenary[p]);
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

    console.log('[+]Initializing stripe for checkout...')
    const stripeDate=flightBillData.map(e=>{
        if(e.count>0){
        return{
                price_data:{
                    currency:currency,
                    product_data:{
                        name:e.passenger_type
                    },
                    unit_amount:Math.round((e.amount.BaseFare+e.amount.Taxes)*100/e.count)
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






async function  reprice (itenary,a,c,i){
    console.log('[+]Initilizing Trip pro reprice...')
    const body={
        "ItineraryId":itenary,
        "AdultPaxCount":a,
        "ChildPaxCount":c,
        "InfantPaxCount":i,
    }
    const headers={
        "Content-Type": "application/json",
        "AccessToken": process.env.TRIPPRO_ACCESSTOKEN
    }
    const url="https://map.trippro.com/resources/api/v3/repriceitinerary"
    const response =await fetch(url,{
        method:"POST",
        headers:headers,
        body:JSON.stringify(body)
    }).catch(err=>{
        console.log('[+]Error with reprice trip pro ',err)
    })
    return response.json()
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

async function createFlightSegment(e){
    // console.log('[+]Flight segment ',e)
    console.log('[+]Creating new FLight Segment...')
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