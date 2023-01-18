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
function hash(string) {
  return createHash('sha256').update(string).digest('hex');
}
const imgFun=async(img,code)=>{
    // console.log("image finding",img,code)
    let res="";  
    await img.map(single=>{
          if(single.roomCode&&single.roomCode==code)
          {
            console.log("img FOUND  ")
              res=single.path;
          }
      })
      return res;
}
const eachRoom = async(roomData,img) => {
    console.log("each room")
    let res=await imgFun(img,roomData.roomCode);
    console.log(res)
    return {
        roomData:roomData,
        image:res
    }
}

const filterResponseRooms =async (data) => {
    let res=[]
    let ans=[]
     res=data.rooms.map((single)=> eachRoom(single,data.images))
     await res.map(async(single)=>{
      let final;
      final=await single.then().then(val=>{return val})
      ans.push(final)
     })
    res=ans
    return({
        code:data.code,
        name:data.name.content,
        rooms : res
        ,
        facilities:data.facilities,
        wildcards:data.wildcards
    });
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

  //METHOD PROVIDED ON HOTEL BEDS TO ENCODE THE APIKEY & SECRET  
const search=async(req,res)=>
{
    try {
        console.log("for search rooms");
    let result=await hotelBedsApi.searchRooms(req.body.code);
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
    console.log("Result fecthed for hotel room details....")
    let filterResponse =await filterResponseRooms(result.data.hotel)
    res.json({
      error : false,
      Results: filterResponse,
      
      
    })
  
    } catch (error) {
      
    }
}



module.exports={search};