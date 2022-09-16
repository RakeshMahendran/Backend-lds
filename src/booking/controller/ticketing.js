const fetch = require('node-fetch')
const parseString = require('xml2js').parseString
const soapRequest =require('easy-soap-request')


exports.ticketing= async (data)=>{
    const flight = data
    let clientId=process.env.clientId
    let pnr = data.api_pnr
    let ref="101655540001"
    if(flight.booking_status==="PNR"){
    let reqBody='  <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v2="http://trippro.com/webservices/orderticket/v2" xmlns:v21="http://trippro.com/webservices/common/v2">'
    reqBody+=`<soapenv:Header /><soapenv:Body><v2:OrderTicketRequestBody><v21:TPContext><v21:messageId>Order_Ticket</v21:messageId><v21:clientId>${clientId}</v21:clientId></v21:TPContext><v2:OrderTicketRequest><v2:RecordLocator>${pnr}</v2:RecordLocator><v2:ReferenceNumber>${ref}</v2:ReferenceNumber></v2:OrderTicketRequest></v2:OrderTicketRequestBody></soapenv:Body></soapenv:Envelope>`
    let response = await bookTicket(reqBody)
    // if(response.TPErrorList!==undefined){
    //     console.log('[+]Error in booking tickets',response)
    // }
    // else if(response.Status[0]==='TICKET ORDERED SUCCESSFULLY'){
    //     console.log('[+]Booking sucess')
    //     data.booking_status="confirmed"
    // }
    // console.log('[+]',response)

    /*  modify the data after tickiting */
    // const data =await data.save();
    return response

    }
}




const bookTicket = async(reqBody)=>{
    /*
    
    const response = fetch(url,{
        method:"POST",
        headers:headers,
        body:reqBody
    })
    return response.json()
    */
   const url=`http://api.trippro.com/api/v2/orderTicket?clientid=${process.env.clientId}`;
   const headers={
       "Content-type":"application/xml"
   }
    
    let { response } = await soapRequest({ url: url, headers: headers, xml: reqBody});

    /*let response=`<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
   <soap:Body>
       <ns2:OrderTicketResponseBody xmlns="http://trippro.com/webservices/common/v2" xmlns:ns2="http://trippro.com/webservices/orderticket/v2">
           <OrderTicketResponse>
               <TPContext>
                   <messageId>eaa0b358-6cf0-4354-a753-981a6e25086e</messageId>
                   <correlationId>Order_Ticket</correlationId>
                   <clientId>YourID</clientId>
               </TPContext>
               <RecordLocator>4KNB69</RecordLocator>
               <Status>TICKET ORDERED SUCCESSFULLY</Status>
           </OrderTicketResponse>
       </ns2:OrderTicketResponseBody>
   </soap:Body>
</soap:Envelope>`

   */

    await parseString(response.body,(err,result)=>{
        response=result
    })
    let obj = {
        "data":response
    }
   return obj
    
    
}

