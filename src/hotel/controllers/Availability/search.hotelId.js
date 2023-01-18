const axios = require("axios")
const { createHash } = require('crypto');
const hotelDetailsModel = require('../../models/hotelDetailsModel')

//IMPORTING SERVICES
const hotelBedsApi=require('../../services/hotelBeds');
//IMPORTING MODEL
const searchModel=require('../../models/searchModel');
const { Console } = require("console");
require('dotenv').config();

//SHA256 HASH
function hash(string) {
  return createHash('sha256').update(string).digest('hex');
}


// arr = []
const eachHotel = (arr,data) =>{
  arr.push([data.code,data.categoryName])
  // console.log(arr);
  return arr
  // return{
  //   hotelCode : data.code
  // }
}

const callApiCode = (data) =>{
  console.log(data.hotelCode);
  // var config = {
  //   method: 'get',
  //   url: '{{endpoint}}/hotel-content-api/1.0/hotels/{{hotelCode}}/details?language=ENG&useSecondaryLanguage=False',
  //   headers: { 
  //     'Api-key': '{{Api-key}}', 
  //     'X-Signature': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 
  //     'Accept': '{{format}}', 
  //     'Accept-Encoding': 'gzip'
  //   }
  // };
  
  // axios(config)
  // .then(function (response) {
  //   console.log(JSON.stringify(response.data));
  // })
  // .catch(function (error) {
  //   console.log(error);
  // });
}

  //METHOD PROVIDED ON HOTEL BEDS TO ENCODE THE APIKEY & SECRET  
const search=async(req,res)=>
{
    try {
        console.log("from searchwithid");
    let result=await hotelBedsApi.searchID(req.body);
    if(result.response&&result.response.data.error)
    {
      res.json(
        {
          error:true,
          data:result
        }
      )
    }
    console.log(result);
//    let hotelCodes = []
//     hotelCodes=result.data.hotels.hotels.map(single => eachHotel(hotelCodes,single))
//     hotelCodes=hotelCodes[hotelCodes.length-1]
//     let resultarr = []
//     // resultarr = await Promise.all([hotelBedsApi.details(40396,detailsarr), hotelBedsApi.details(46136,detailsarr)]);
//     for(i =0;i<hotelCodes.length;i++){
//       // console.log(i);
//       console.log(hotelCodes[i][0]);
//       let details = await hotelDetailsModel.findOne({"code":hotelCodes[i][0],function (err,results) {
//         console.log("error",err);
//       }}).clone()
//       // console.log(details);
      
//       // console.log("push");
//       resultarr[i] = details
//       // console.log(details)
      
//     }
//     // console.log(resultarr);
//     // console.log("donme");
//     // USING FILTER
//     filterResponse = []
//     for (i =0; i<resultarr.length;i++){
//       // console.log("filter", i);
//       if (resultarr[i]!=null){
//         filterResponse.push(searchModel.filterResponse(resultarr[i],hotelCodes));
//       }
//     }
//     console.log("-----end---");
    res.json({
      error : false,
      ResultID: "A01231212",
    //   total : result.length,
      Results: result.data,
      
    })
  
    } catch (error) {
      
    }
}



module.exports={search};