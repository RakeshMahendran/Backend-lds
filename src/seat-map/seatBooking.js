const fetch= require('node-fetch');
const Axios=require('axios')
function createSeatRequest(itinearyId){
    console.log('[+]Creating request body...')
    const seatRequest={
        "ItineraryId": itinearyId,
        }
        return seatRequest
}

seatItinerary=async(seatRequest)=>{
    console.log('[+]Fetch request...')
    const url="http://map.trippro.com/seatAvailSearch"
    const headers={
        "Content-type":"application/json",
        "AccessToken":process.env.TRIPPRO_ACCESSTOKEN,
        "clientId":"TRAVELKA22"
    }
  
     const response=await Axios.post(url,{
        method:"POST",
        headers:headers,
        body:JSON.stringify(seatRequest)
     })
    console.log('[+]Request done...')
    console.log(response);
    return response.data
}


exports.seatMap= async(req,res) => {

     const seatRequest= createSeatRequest()
     const seatResponse=await seatItinerary(seatRequest);
      res.json(seatResponse);
}