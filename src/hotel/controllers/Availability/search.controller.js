//IMPORTING SERVICES
const hotelBedsApi=require('../../services/hotelBeds');
//IMPORTING MODEL
const searchModel=require('../../models/searchModel');
require('dotenv').config();

// const resultjson = require("./amadeus.json")

const eachHotel = (arr,data) =>{
  return data.code
}

const searchWithId=async(codes)=>
{
    try {
      console.log("[+]from searchwithid");
      let result = await hotelBedsApi.searchWithCodes(codes);
      if(result.response&&result.response.data.error)
      {
        return({
          error:true,
          data: result.response.data.error
        })
      }
      return {
        error:false,
        data:result.data
      }
    } 
    catch (error) {
      return error
    }
}


  //METHOD PROVIDED ON HOTEL BEDS TO ENCODE THE APIKEY & SECRET  
const search=async(req,res)=>
{
    try
    {
 

    let result=await hotelBedsApi.search(req.body);
        if(result.response&&result.response.data.error)
        {
          res.json(
            {
              error:true,
              message:"Error in fetching Dynamic data\n"+result.response.data.error.message,
              Results:[]
            }
          )
        }
        else
        {
                let hotelCodes = []
                hotelCodes=result.data.hotels.hotels.map(single => eachHotel(hotelCodes,single))
                console.log(hotelCodes);
            
                let details= searchWithId(hotelCodes)
                //extracting promise
                let final;
                await details.then().then(val=>{
                  //  console.log(val)
                  final=val;    
                })
                    
                result = result.data.hotels.hotels,
                final = final.data.hotels
              //  final = resultjson.final                //for using local data(to reduce number of requests)
              //  result = resultjson.result
                
                // USING FILTER
                filterResponse = []
                console.log(final.length,result.length);
                for (let i =0; i<result.length;i++){
                  // console.log("filter", i);
                  for (let j = 0;j<final.length;j++){
                    if (result[i].code == final[j].code){
                      // console.log("filter got", i , j );
                      final[j].rooms && filterResponse.push(searchModel.filterResponse(result[i],final[j]));
                      break;
                    }
                  }         
                }
                function filterArray(data){
                  return data.rooms.length>0
                }
                
                filterResponse=filterResponse.filter(filterArray)
                
                       console.log("-----end---");
                       res.json({
                         error : false,
                         ResultID: "12345",
                         total:filterResponse.length,
                         Results: filterResponse,
                         final : final,
                         result: result
                
                       })
          }
  } catch (error) {
      console.log("Error in searchcontroller file: ",error);
      res.json(
        {
              error:true,
              Results:[],
              message:"Error in search.controller file"+error.message
        }
  )
  }
}



module.exports={search};
























 // let resultarr = []
    // // resultarr = await Promise.all([hotelBedsApi.details(40396,detailsarr), hotelBedsApi.details(46136,detailsarr)]);
    // for(i =0;i<hotelCodes.length;i++){
    //   // console.log(i);
    //   console.log(hotelCodes[i]);
    //   let details = await hotelDetailsModel.findOne({"code":hotelCodes[i],function (err,results) {
    //     console.log("error",err);
    //   }}).clone()
    //   // console.log(details);
      
    //   // console.log("push");
    //   resultarr[i] = details
    //   // console.log(details)
      
    // }
    // // console.log(resultarr);
    // // console.log("donme");
    // // USING FILTER
    // filterResponse = []
    // for (i =0; i<resultarr.length;i++){
    //   // console.log(resultarr[i]);
    //   // console.log("detailsArr",detailsArr[i].code);
    //   if (resultarr[i]!=null){
    //     // console.log("filter", i);
    //     for (let j = 0;j<detailsArr.length;j++){
    //       if (resultarr[i].code == detailsArr[j].code){
    //         // console.log("filter got", i);
    //         filterResponse.push(searchModel.filterResponse(resultarr[i],detailsArr[j]));
    //         break;
    //       }
    //     }         
    //   }
    // }
// hotelCodes = [1,2,700,456,345,783,1123,1100,234,555,999,948,45,10,222,346,985,454,1000,333,867,898]
// hotelCodes =   [
//     [ 142665, '4 STARS' ],
//     [ 189672, '4 STARS' ],
//     [ 104034, '5 STARS' ],
//     [ 325025, '3 STARS' ],
//     [ 13445, '3 STARS' ],
//     [ 423218, '4 STARS' ],
//     [ 190868, '4 STARS' ],
//     [ 13023, '3 STARS AND A HALF' ],
//     [ 13017, '4 STARS' ],
//     [ 325026, '5 STARS LUXURY' ],
//     [ 155566, '4 STARS AND A HALF' ],
//     [ 92942, '3 STARS' ],
//     [ 124294, '3 STARS AND A HALF' ],
//     [ 81936, '4 STARS' ],
//     [ 13007, '4 STARS' ],
//     [ 68981, '4 STARS' ],
//     [ 182811, '3 STARS AND A HALF' ],
//     [ 108178, '4 STARS' ],
//     [ 191794, '4 STARS' ],
//     [ 541978, '3 STARS' ],
//     [ 143433, '3 STARS' ],
//     [ 25657, '1 STAR' ],
//     [ 123237, '3 STARS' ],
//     [ 182857, '3 STARS' ],
//     [ 232197, '3 STARS AND A HALF' ],
//     [ 82771, '3 STARS' ],
//     [ 156757, '4 STARS' ],
//     [ 85678, '4 STARS' ],
//     [ 13054, '4 STARS' ],
//     [ 49014, '3 STARS' ],
//     [ 13392, '4 STARS' ],
//     [ 90086, '4 STARS' ],
//     [ 365207, '3 STARS' ],
//     [ 88537, '2 STARS' ],
//     [ 233379, '3 STARS' ],
//     [ 186907, '3 STARS AND A HALF' ],
//     [ 405818, '3 STARS AND A HALF' ],
//     [ 324245, '3 STARS' ],
//     [ 43105, '4 STARS' ],
//     [ 25354, '3 STARS AND A HALF' ],
//     [ 573311, '5 STARS' ],
//     [ 323110, '2 STARS' ],
//     [ 481064, '5 STARS' ],
//     [ 323523, '4 STARS' ],
//     [ 669882, '3 STARS' ],
//     [ 663350, '3 STARS' ],
//     [ 749022, '4 STARS AND A HALF' ],
//     [ 585808, '3 STARS' ],
//     [ 618434, '4 STARS' ],
//     [ 325230, '4 STARS' ],
//     [ 459796, '3 STARS' ],
//     [ 646547, '3 STARS' ],
//     [ 851831, '4 STARS' ],
//     [ 721833, '4 STARS' ],
//     [ 770197, '2 STARS' ],
//     [ 654308, '3 STARS' ],
//     [ 638447, '4 STARS' ]
  // ]