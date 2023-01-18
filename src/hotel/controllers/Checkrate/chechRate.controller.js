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
const checkRate=async(req,res)=>
{
    try {
    console.log("For checkRate[+]");
    let result=await hotelBedsApi.checkRate(req.body);
    // console.log(result);
    if(result.response&&result.response.data.error)
    {
      res.json(
        {
          error:true,
          message:"Error in CheckRate API call result:\n "+result.response.data.error
        }
      )
    }
    else{
      // console.log(result.data);
      console.log("Result fecthed for checkRate....")
      console.log(".....THE END....")
      let filterResponse =await filterResponseCheckRate(result.data.hotel)
      res.json({
        error : false,
        Results:filterResponse,
        // Results: result.data,
        
        
      })  
    }}
    catch (error) {
      console.log("Error in CheckRate: ",error);
      res.json(
        {
              error:true,
              Results:{},
              message:"Error in checkRate file \n"+error
        }
    )}
}



module.exports={checkRate};