const parseString = require('xml2js').parseString
const soapRequest = require('easy-soap-request')
const FlightBooking = require('../model/flight_booking')

exports.readTicket=async(req,res)=>{
    const booking =await FlightBooking.findById(req.bookingId)
    if (booking===undefined){
        return res.json({
            error:true,
            message:"unable to find the booking"
        })
    }
    const response =await readTicketReq(booking.api_pnr,booking.api_refNum)
    if(response["ns2:ReadETicketResponse"]!==undefined){
        const ticketDet = response["ns2:ReadETicketResponse"][0]
        const ticketNumber = ticketDet["ns2:ETicketNumber"][0].split(",")
        const ticketMsg = ticketDet["ns2:Remarks"][0]["MessageText"][0]
        return res.json({
            error:false,
            ticketNumber:ticketNumber,
            message:ticketMsg,
            bookingData:req.bookingData
        })
    }
    if(response["TPErrorList"]!==undefined){
        return res.json({
            error:false,
            message:response["TPErrorList"][0]["TPError"][0]["errorText"][0]
        })

    }
}


async function readTicketReq(pnr,ref){
    
    const url = `http://api.trippro.com/api/v2/readEticket?clientid=${process.env.clientId}`
    const headers = {
        "Content-type":"application/xml"
    }
    const reqbody=` <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v2="http://trippro.com/webservices/readeticket/v2" xmlns:v21="http://trippro.com/webservices/common/v2">
    <soapenv:Header></soapenv:Header>
    <soapenv:Body>
        <v2:ReadETicketRequestBody>
            <v21:TPContext>
                <v21:messageId>ReadEticket</v21:messageId>
                <v21:clientId>${process.env.clientId}</v21:clientId>
            </v21:TPContext>
            <v2:ReadETicketRequest>
                <v2:RecordLocator>${pnr}</v2:RecordLocator>
                <v2:ReferenceNumber>${ref}</v2:ReferenceNumber>
            </v2:ReadETicketRequest>
        </v2:ReadETicketRequestBody>
    </soapenv:Body>
</soapenv:Envelope>`

let {response }= await soapRequest({url:url,headers:headers,xml:reqbody})


await parseString(response.body,(err,result)=>{
    response=result
})

let obj = {
    "data":response
}

console.log('[+]Read ticket response ',obj)
return obj.data["soap:Envelope"]["soap:Body"][0]["ns2:ReadETicketResponseBody"][0]

}