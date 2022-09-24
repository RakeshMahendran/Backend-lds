const FlightBooking = require('../model/flight_booking')
const FlightSegment = require('../model/flight_segment')
const Journey = require('../model/flight_journey')

const fetch = require ('node-fetch')

exports.getPrice=async (req,res)=>{
    console.log('[+]Initilizing Trip pro reprice...')
    const p = req.body
    const price=await repriceit(req.itineraryId,p.AdultCount,p.ChildCount,p.InfantCount)

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

async function repriceit(it,a,c,i){

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

exports.repriceAndAddJourney=async (req,res,next)=>{

    console.log('[+]Initiating reprice and add journey...')

    const flight =await FlightBooking.findById(req.bookingId)
    const {ADT,CHD,INT}= req.paxTypeCount
    const reprice= await repriceit(flight.target_api,ADT,CHD,INT)
    console.log('[+]reprice ',reprice)
    if(reprice.ErrorCode!==undefined){
        return res.json({
            error:true,
            message:reprice.ErrorText
        })
    }
    flight.setFare(reprice.Fares,req.paxTypeCount);
    flight.airline=reprice.ValidatingCarrierName

    for(f of reprice.Citypairs){
        const newJourney = new Journey()
        for(fs of f.FlightSegment){
            const flightSegment = await newFlightSegment(fs)
            newJourney.journey_segments.push(flightSegment._id)
        }
        let j = await newJourney.save();
        flight.flight_journey.push(j._id)
    }

    await flight.save()

    console.log('[+]Finished reprice and add journey...')

    next()

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

