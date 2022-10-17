
const fetch = require('node-fetch')
const { notify } = require('../../../routes/paymentRoutes')
const parseString = require('xml2js').parseString


const FlightBooking = require('../model/flight_booking')

exports.cancelPNR=async(pnr)=>{
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

    return jsonResponse["soap:Envelope"]["soap:Body"][0]["ns2:CancelPNRResponseBody"][0]

}

exports.cancel=async (req,res)=>{
    const flight= await FlightBooking.findById(req.bookingId)
    if(!flight){
        return res.json({
            error:true,
            message:"wrong booking id"
        })
    }
    if(flight.payment_status==="unpaid"){
        if(flight.booking_status==="PNR"){
            const response=await cancelPNR(flight.api_pnr)
            if(response["TPErrorList"]!==undefined){
                return res.json({
                    error:false,
                    message:response["TPErrorList"][0]["TPError"][0]["errorText"][0]
                })
            }

            flight.booking_status="cancled"
            await flight.save();

            return res.json({
                error:false,
                // data:response["ns2:CancelPNRResponse"][0][]
                data:{
                    pnr:response["ns2:CancelPNRResponse"][0]["ns2:RecordLocator"][0],
                    status:response["ns2:CancelPNRResponse"][0]["ns2:Status"][0]
                }
            })
        }
    }

    if(flight.booking_status==="ticketing"){
        const response=await cancelPNR(flight.api_pnr)
        if(response["TPErrorList"]!==undefined){
            return res.json({
                error:false,
                message:response["TPErrorList"][0]["TPError"][0]["errorText"][0]
            })
        }

        flight.booking_status="cancled"
        await flight.save();

        return res.json({
            error:false,
            // data:response["ns2:CancelPNRResponse"][0][]
            data:{
                pnr:response["ns2:CancelPNRResponse"][0]["ns2:RecordLocator"][0],
                status:response["ns2:CancelPNRResponse"][0]["ns2:Status"][0]
            },
            message:"Refund for your ticket will be processed as per the policy"
        })
    }

    // console.log('[+]Booking detials ',flight)
}

/*

booked pnr
    paid
        booked
            cancel the ticket
            calc the refund amount
            inti refund
        unbooked
            cancel pnr
            init refund
    unpaid
        notify the user
        cancel the pnr

*/
