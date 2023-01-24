const FlightBooking = require('../model/flight_booking')
const FlightSegment = require('../model/flight_segment')
const Journey = require('../model/flight_journey')

const {bestMarkUp}= require("../../markup/controllers/bestMarkUp")

const fetch = require ('node-fetch')

exports.getPrice=async (req,res)=>{
    console.log('[+]Initilizing Trip pro reprice...')
    const p = req.body
    const price=await repriceit(req.itineraryId,p.AdultCount,p.ChildCount,p.InfantCount)
    console.log('[+]Price ',price)

    if(price===undefined){
        return res.json({
            error:true,
            message:"Unable to get the reprice data"
        })
    }
    if(price.ErrorCode!==undefined){
        return res.json({
            error:true,
            message:price.ErrorText
        })
    }
     try
     {
        let origin = price.Citypairs[0].FlightSegment[0].DepartureLocationCode
        let destination = price.Citypairs[0].FlightSegment[0].ArrivalLocationCode
        let airline=price.ValidatingCarrierName
        // console.log('[=]',price.Citypairs[0])
        console.log('[+]Markup ',origin,destination,airline)
        console.log('[+]Reprice ',price)
        
    
        const markup = await bestMarkUp(origin,destination,airline)
        console.log('[+] Best markup ', markup)
    
        if(markup !==undefined){
            if(markup.markup_type==="%" ){ 
                price.Fares.map((e,i)=>{
                    let base_fare=(e.BaseFare*markup.markup_value)/100
                    e.BaseFare=Math.round(base_fare+e.BaseFare)
                })
            }
            else{
                price.Fares.map((e,i)=>{
                    e.BaseFare+=markup.markup_value
                })
            }
        }
        
        console.log('[+]Reprice done...')
        res.json({
            error:false,
            Fares:price
        })
     }
     catch(e)
     {
          res.json(
              {
                  error:true,
                  response:'Error while adding Markup & Checking Reprice',
                  message:e.message
              }
          )
     }

}

async function repriceit(it,a,c,i){
  try{

      const body={
          "AdultCount":a,
          "ChildCount":c,
          "InfantCount":i
       }
    
          console.log('[+]Reprice body ',body)
    
      const headers={
          "Content-Type":"application/json",
          "Access_token":"abcd"
      }
    
      const url=`${process.env.CUSTOMERSERVICE}/api/v1/flight/reprice/${it}`;
    
      const response=await fetch(url,{
          method:"POST",
          headers:headers,
          body:JSON.stringify(body)
      })
      
      return response.json()
  }
  catch(e)
  {
      console.log('Error in repriceit function')
      res.json(
          {
              error:true,
              message:error.message,
              response:'Error while fetching the reprice from tripro'
          }
      )
  }

}

exports.repriceAndAddJourney=async (req,res,next)=>{

    try{

        console.log('[+]Reprice and add journey init...')

        const flight = await FlightBooking.findById(req.bookingId)
        if(!flight){
            throw{
                message:`Unable to process current repriceAndJourney for the booking id ${req.bookingId}`
            }
        }
        const {ADT,CHD,INT}= req.paxTypeCount
        const {error,message,Fares,reprice}= await repriceit(flight.target_api,ADT,CHD,INT)
        
        console.log('[+]Destructured vars',error,Fares,reprice)        
        if(error){

            throw{
                message:message
            }
        }
               

        flight.setFare(reprice.Result.FareBreakdown,req.paxTypeCount)
        flight.airline=reprice.Result.MarketingAirlineName

        for(f of reprice.Result.Itinerary){
            const newJourney = new Journey()
            for(fs of f.OriginDestination){
                // console.log('[+]Itenery ',fs)
                const flightSegment = await newFlightSegment(fs)
                newJourney.journey_segments.push(flightSegment._id)
            }
            let j = await newJourney.save();
            flight.flight_journey.push(j._id)
        }

        await flight.save()

        console.log('[+]Finished reprice and add journey...',flight._id)
        
        next()

    }catch(e){
        console.log(`[*]${e.message}`)
        return res.json({
            error:true,
            message:e.message
        })
    }

}


async function newFlightSegment(e){
    // console.log('[+]Flight segment ',e)
    console.log('[+]Creating new FLight Segment...',e)
    const newFlightSegment= new FlightSegment()
    
    newFlightSegment.origin_code=e.OriginCode
    newFlightSegment.destination_code=e.DestinationCode
    newFlightSegment.departure_dateTime=e.DepartureTime
    newFlightSegment.arrival_dateTime=e.ArrivalTime
    newFlightSegment.operating_airline_code=e.OperatingAirline
    newFlightSegment.farebasis=e.FareBasis
    newFlightSegment.bookingClass=e.BookingClass
    newFlightSegment.flight_number=e.OperatingFlightNumber
    newFlightSegment.origin_airport_name=e.OriginAirportName
    newFlightSegment.destination_airport_name=e.DestinationAirportName

    return await newFlightSegment.save()
}

