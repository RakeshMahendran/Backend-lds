const fetch = require('node-fetch')

const FlightBooking=require('../model/flight_booking')
const Journey = require('../model/flight_journey')
const FlightSegment= require('../model/flight_segment')

// exports.seat =async(req,res)=>{
//     console.log('[+]Request to check seat ',req.body)
//     try
//     {
//         const itinearyid = req.body.itinearyid
//         const url = "http://map.trippro.com/seatAvailSearch"
//         const headers={
//             "Content-type":"application/json",
//             "AccessToken":process.env.TRIPPRO_ACCESSTOKEN
//         }
    
//         fetch(url,{
//             method:"POST",
//             headers:headers,
//             body:JSON.stringify({"ItineraryId":"3e256431a37346f1a16807f3ed4c0121"})
//         }).then(res=>res.json()).then(res=>console.log('[+]Response from seat ',res))
//     }
//     catch(e)
//     {
//         res.json(
//             {
//                 error:true,
//                 response:"Error in seat",
//                 message:e.message
//             }
//         )
//     }
    
// }


/** 
 * check for precense of seat
 * if seat not present
 *      next()
 * else
 *      get the seat details from trippro
 *      match the details from frontend and store it in db
 *      update the fares in the db
 *      send the seat details to customerservice for booking
 */

exports.seat=async(req,res,next)=>{
    console.log('[+]Seat map init...')
    try{
    if(req.body.Seat===undefined){
        
        throw{}
      
    }

    const flight= await FlightBooking.findById(req.bookingId)
    flight.seat_charge_total_fare=0;
    flight.seat_assignment_total_fare=0;
    const itenearyId=flight.target_api
    const headers={
        "Content-Type":"application/json",
        "Access_token":"abcd"
    }
    const body={
        itId:itenearyId
    }
    let response=await fetch(`${process.env.CUSTOMERSERVICE}/api/v1/flight/seat`,{
        method:"POST",
        headers:headers,
        body:JSON.stringify(body)
    })

    response= await response.json()

    const journeyId= flight.flight_journey

    const journeys=[]

    for (j in journeyId){
        let journey= await Journey.findById(journeyId[j])
        let segmentId=journey.journey_segments
        let segments=[]
        for(s in segmentId){
            let segment= await FlightSegment.findById(segmentId[s])
            segments.push(segment)
        }
        journeys.push(segments)
    }
    
    let SeatAssignementFeePerSegment=response.SeatAssignementFeePerSegment
    for(s of req.body.Seat){
        let cityPair=parseInt(s.CityPairNum)
        let segmentNo=parseInt(s.SegmentNo)
        let selectedSeats=s.SelectedSeatsNames

        let segmentSeatMap=response.segmentSeatMap
        console.log('[+]segmentSeatMap',response)
        let cs=segmentSeatMap[cityPair+segmentNo]
        let csDb=journeys[cityPair][segmentNo]

        try{
            if(cs.origin!==csDb.origin_code)
                throw{message:"origins misMatch"}
            if(cs.destination!==csDb.destination_code)
                throw{message:"Destination misMatch"}
            if(cs.segmentRef!==csDb.segmentRef)
                throw{message: "segment Reference mismatch"}
            if(parseInt(cs.flightNumber)!== csDb.flight_number)
                throw{message:`FlightNumber mismatch ${cs.flightNumber} and ${csDb.flight_number}`}
            
        }catch(e){
            console.log('[+]',e.message)
            return res.json({
                error:true,
                message:e.message
            })
        }

        let seatCost=0;

        for(ss of selectedSeats){
            let row=parseInt(ss[0])
            let col=ss[1]

            let cabin= cs.cabins[0]
            let ColIndex
            let RowIndex

            try{
                if(!(cabin.rowStart<=row && cabin.rowEnd>=row)){
                    throw{
                        message:"Unable to find the seat row..."
                    }
                }
                let filterOrder=cabin.seatOrder.filter(e=>e!=="WW")
                ColIndex=filterOrder.findIndex(e=>e===col)
                if(ColIndex<0){
                    throw{
                        message:"Unable to find seat col..."
                    }
                }
                
                RowIndex=cabin.rows.findIndex(e=>e.rowNumber===row)
                if(RowIndex<0){
                    throw{
                        message:"Unexpected mismatch of seat row"
                    }
                }
                
                let currentSeat=cabin.rows[RowIndex].seats[ColIndex]
                
                console.log(`[+]RowIndex ${RowIndex} and ColIndex ${ColIndex}`)
                // console.log('[+]Current Seat ',Co)
                if(currentSeat.seatColumn!==col){
                    console.log('[+]Unexpected mismatch of seat col ',currentSeat,col)
                    throw{
                        message:"Unexpected mismatch of seat col"
                    }
                }

                if(currentSeat.occupied){
                    throw{
                        message:"This seat is allready occupied"
                    }
                }

                csDb.seat.push({
                    row:row,
                    column:col,
                    cost:currentSeat.chargeAmount?currentSeat.chargeAmount:0,
                    currency:currentSeat.chargeCurrency,
                    pantry:currentSeat.pantry,
                    premium:currentSeat.premium,
                    legRoomSeat:currentSeat.legRoomSeat
                })
                seatCost+=currentSeat.chargeAmount?currentSeat.chargeAmount:0
                console.log('[+]current segment in db ',csDb)
                

            }catch(e){
                return res.json({
                    error:true,
                    message:e.message,
                    tripPro:response
                })
            }           
        }
        journeys[cityPair][segmentNo]=csDb
        await journeys[cityPair][segmentNo].save() 
        flight.seat_charge_total_fare+=seatCost
        flight.seat_assignment_total_fare+=SeatAssignementFeePerSegment
    }

    await flight.save()

    console.log("[+]journeys...",journeys)

    console.log('[+]seat search response ',response)
    next()
    }
    catch(e){
        console.log('[+]Not seats requested forwarding to next')
        next()

    }
    

}