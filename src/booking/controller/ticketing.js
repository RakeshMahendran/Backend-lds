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
        let response = await bookTicket(pnr,ref)
        console.log('[+]Ticket response ',response)
        // if(response.OrderTicketResponse!==undefined){
        //     console.log('[+]ticket status ',response.OrderTicketResponse[0].Status)
        //     return {
        //         error:false,
        //         ticketResponse:response.OrderTicketResponse[0].Status,
        //         data:data
        //     }
        // }
        // else if(response.TPErrorList!==undefined){
        //     console.log('[+]Error in ticketing booking')
        //     return {
        //         error:true,
        //         ticketResponse:response.TPErrorList,
        //         data:data
        //     }
        // }
        console.log('[+]Not defined')

        const data =await data.save();

    }
}




const bookTicket = async(pnr,refnum)=>{
   
   const url=`${process.env.CUSTOMERSERVICE}/api/v1/flight/ticketing`;
   const headers={
       "Content-type":"application/xml"
   }
    
//    console.log('[+]Ticketing request ',reqBody)
    // let { response } = await soapRequest({ url: url, headers: headers, xml: reqBody});
//    console.log('[+]Response from ticketing ',response)
   
   let response = await fetch(url,{
    headers:headers,
    method:"POST",
    body:{
        pnr:pnr,
        refnum:refnum
    }
    })

    response= await response.json();
    
    return response
    
    
}

