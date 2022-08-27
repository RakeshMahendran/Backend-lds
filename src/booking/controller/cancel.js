
const fetch = require('node-fetch')
const parseString = require('xml2js').parseString


const FlightBooking = require('../model/flight_booking')

const cancelPNR=async(pnr)=>{
    reqBody='<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v2="http://trippro.com/webservices/cancelpnr/v2" xmlns:v21="http://trippro.com/webservices/common/v2">'
    reqBody+='<soapenv:Header />'
    reqBody+=`<soapenv:Body>
    <v2:CancelPNRRequestBody>
        <v21:TPContext>
            <v21:messageId>Cancel_PNR</v21:messageId>
            <v21:clientId>${process.env.clientId}</v21:clientId>
        </v21:TPContext>
        <v2:CancelPNRRequest>
            <v2:RecordLocator>${pnr}</v2:RecordLocator>
        </v2:CancelPNRRequest>
    </v2:CancelPNRRequestBody>
</soapenv:Body>`

const headers={
    "Content-Type":"application/xml",
}
console.log('[+]Cancel pnr init...')
   let response=await fetch(`http://api.trippro.com/api/v2/cancelPnr?clientid=${process.env.clientId}`,{
        method:"POST",
        headers:headers,
        body:reqBody
    })
    
    response=await response.text();
    let jsonResponse
    await parseString(response,(err,result)=>{
        jsonResponse=result
    })

    return jsonResponse

}

exports.cancel=async (req,res)=>{
    const flight= await FlightBooking.findById(req.bookingId)
    if(flight.payment_status==="unpaid"){
        if(flight.booking_status==="PNR"){
            const response=await cancelPNR(flight.api_pnr)
            res.json({
                error:false,
                data:response
            })
        }
    }

    // console.log('[+]Booking detials ',flight)
}