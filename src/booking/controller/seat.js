const fetch = require('node-fetch')


exports.seat =async(req,res)=>{
    console.log('[+]Request to check seat ',req.body)
    const itinearyid = req.body.itinearyid
    const url = "http://map.trippro.com/seatAvailSearch"
    const headers={
        "Content-type":"application/json",
        "AccessToken":process.env.TRIPPRO_ACCESSTOKEN
    }

    fetch(url,{
        method:"POST",
        headers:headers,
        body:JSON.stringify({"ItineraryId":"3e256431a37346f1a16807f3ed4c0121"})
    }).then(res=>res.json()).then(res=>console.log('[+]Response from seat ',res))
    
}