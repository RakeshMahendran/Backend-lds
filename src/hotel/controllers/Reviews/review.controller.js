//IMPORTING TRIP ADVISOR SERVICES
const tripAdvisorAPi=require('../../services/tripAdvisor')
require('dotenv').config();

const findID=async(req)=>{
      // console.log(req.body)
      try
      {
            let result=await tripAdvisorAPi.locationID(req)
            if(result.response&&result.response.data.error)
            {
                  return "error"
            }
            else
            {
                  
                  //RETURNS THE FIRST HOTEL BECOZ SINCE WE SEARCHED WITH HOTEL NAME,LONG,LAT , I BELIEVE WE GET THE FIRST OBJECT AS OUR HOTEL,MAY VARY I DIDN'T CHECK
                  return  result.data.data[0].location_id
            }
      }
      catch(e){
            return "error"
      }
}

const reviews=async(req,res)=>{
      console.log("Calling For Hotel Reviews[+]")
      try
      { 
          let id=await findID(req)
          console.log("ID:",id)
          if(id=="error")
          {
                res.json(
                      {
                            error:false,
                            result:[],
                            message:"NO HOTELS FOUND"
                      }
                )
          }
          else
          {
                  let result=await tripAdvisorAPi.review(id)
                  if(result.response&&result.response.data.error)
                  {
                        res.json(
                              {
                              error:true,
                              result:[],
                              message:result.response.data.error,
                              }
                        )
                  }
                  else
                  {
                        // console.log(result)
                        res.json(
                              {
                                    error:false,
                                    result:result.data.data
                              }
                        )
                  }
          }
      }
      catch(e){
          res.json(
                {
                      error:true,
                      result:[],
                      message:e
                }
          )
      }
}
module.exports={findID,reviews}