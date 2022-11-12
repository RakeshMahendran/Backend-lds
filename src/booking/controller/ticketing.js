const fetch = require('node-fetch')
const parseString = require('xml2js').parseString
const soapRequest =require('easy-soap-request')


exports.ticketing= async (data)=>{
    console.log('[+]Into ticketing')
    const flight = data
    let clientId=process.env.clientId
    let pnr = data.api_pnr
    let ref=data.api_refNum
    if(flight.booking_status==="ticketing"){
    let reqBody='  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v2="http://trippro.com/webservices/orderticket/v2" xmlns:v21="http://trippro.com/webservices/common/v2">'
    reqBody+=`<soapenv:Header/><soapenv:Body><v2:OrderTicketRequestBody><v21:TPContext><v21:messageId>Order_Ticket</v21:messageId><v21:clientId>${clientId}</v21:clientId></v21:TPContext><v2:OrderTicketRequest><v2:RecordLocator>${pnr}</v2:RecordLocator><v2:ReferenceNumber>${ref}</v2:ReferenceNumber></v2:OrderTicketRequest></v2:OrderTicketRequestBody></soapenv:Body></soapenv:Envelope>`
    let response = await bookTicket(reqBody)
    console.log('[+]Ticket response ',response)
    if(response.OrderTicketResponse!==undefined){
        console.log('[+]ticket status ',response.OrderTicketResponse[0].Status)
        return {
            error:false,
            ticketResponse:response.OrderTicketResponse[0].Status,
            data:data
        }
    }
    else if(response.TPErrorList!==undefined){
        console.log('[+]Error in ticketing booking')
        return {
            error:true,
            ticketResponse:response.TPErrorList,
            data:data
        }
    }
    console.log('[+]Not defined')

    // const data =await data.save();

    }
}




const bookTicket = async(reqBody)=>{
   
   const url=`http://api.trippro.com/api/v2/orderTicket?clientid=${process.env.clientId}`;
   const headers={
       "Content-type":"application/xml"
   }
    
   console.log('[+]Ticketing request ',reqBody)
    let { response } = await soapRequest({ url: url, headers: headers, xml: reqBody});
   console.log('[+]Response from ticketing ',response)
  

    await parseString(response.body,(err,result)=>{
        response=result
    })
    
    let obj = {
        "data":response
    }

    console.log('[+]Ticket response ',obj)
   return obj.data["soap:Envelope"]["soap:Body"][0]["ns2:OrderTicketResponseBody"][0]
    
    
}

