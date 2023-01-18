const axios = require("axios")
const { createHash } = require('crypto');
const hotelDetailsModel = require('../../models/hotelDetailsModel')

//IMPORTING SERVICES
const hotelBedsApi=require('../../services/hotelBeds');
//IMPORTING MODEL
const searchModel=require('../../models/searchModel');
const { Console } = require("console");
const { filterClientRequest } = require("../../../flight/models/searchModel");
require('dotenv').config();

//SHA256 HASH

const filterResponseCheckRate =async (data) => {
    return({
        code:data.code,
        name:data.name,
        currency: data.currency,
        modificationPolicies: data.modificationPolicies,
        rooms:data.rooms,
        totalNet:data.totalNet
    });
}

  //METHOD PROVIDED ON HOTEL BEDS TO ENCODE THE APIKEY & SECRET  
const cancel=async(req,res)=>
{
    try {
    console.log("For cancelling[+]");
    let result=await hotelBedsApi.cancel(req.body);
    console.log(result);
    if(result.response&&result.response.data.error)
    {
      res.json(
        {
          error:true,
          data:result.response.data.error,
          Results: [],
        }
      )
    }else{
        console.log(result.response.data);
        console.log("Result fecthed for booking....")
        console.log(".....THE END....")
        // let filterResponse =await filterResponseCheckRate(result.data.hotel)
        res.json({
          error : false,
        //   Results:filterResponse,
          Results: result.data,
          
          
        })

    }
  
    } catch (error) {
      console.log("Error in cancellation: ",error);
    }
}



module.exports={cancel};