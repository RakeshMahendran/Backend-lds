const fetch = require('node-fetch')


exports.seatMap =async(req,res)=>{
    try
    {
        console.log('[+]Request to check seat ',req.body)
        const itineraryid = req.body
        console.log( itineraryid)
        const url = "http://map.trippro.com/seatAvailSearch"
        const headers={
            "Content-type":"application/json",
            "AccessToken":process.env.TRIPPRO_ACCESSTOKEN
        }
    
       const settings = async() => await fetch(url,{
            method:"POST",
            headers:headers,
            body:JSON.stringify(itineraryid)
        })
    
         .then(res=>res.json())
         .then(seatMap=>res.json(seatMap))   
        
         settings()
    }
    catch(e)
    {
             res.json(
                 {
                     error:true,
                     response:"Error in seat mapping",
                     message:e.message
                 }
             )
    }
    // res.then(value=>console.log('[+]', value))
}


// const fetch = require('node-fetch')

// exports.seatMap = async(req,res)=>{
//     console.log('[+]Request to check seat ',req.body)
//     const itineraryid = req.body
//     console.log( itineraryid)
//       const seatRequest= createSeatRequest()
//       const seatResponse=await seatItinerary(seatRequest);
// }

//  function createSeatRequest(itineraryid) {
//     const seatRequest = {
//      "ItineraryId": itineraryid,  
//     }
//     return seatRequest
//  }

// seatItinerary = async (itineraryid) => {
     
//        const url = "http://map.trippro.com/seatAvailSearch"
//        const headers={
//         "Content-type":"application/json",
//         "AccessToken":process.env.TRIPPRO_ACCESSTOKEN
//     }
//        const settings = await fetch(url,{
//         method:"POST",
//         headers:headers,
//         body:JSON.stringify(itineraryid)
//     })
//     return settings.json()
// }