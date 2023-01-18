var exports = module.exports = {};
const fGroupCodes = require("../controllers/Availability/FacilityGroupsCode.json")

//for all ratings
const returnRatingInInt=(code)=>{
  if(code.length<8)
  {
     return code[0]
  }
  else
  {
    return code[0]+'.5'
  }
}

const convertCodetoDes=(code)=>{
  for(let i =0;i<fGroupCodes.length;i++){
    if(fGroupCodes[i].code==code){
      return fGroupCodes[i].description
    }
  }
}
//for hotelFacilities

const hotelFacilites=(facilityArr)=>{
  let obj= {}
  facilityArr && facilityArr.map((single)=>{
    if(single.facilityGroupCode){
      let val = convertCodetoDes(single.facilityGroupCode)
      if(single.number){
        if (obj[val]==null){
          obj[val] = [single.description.content+"-"+single.number]
        }
        else{
          obj[val].push(single.description.content+"-"+single.number)
        }
      }
      else if(single.distance){
        if (obj[val]==null){
          obj[val] = [single.description.content+"-"+single.distance]
        }
        else{
          obj[val].push(single.description.content+"-"+single.distance)
        }
      }
      else{
        if (obj[val]==null){
          obj[val] = [single.description.content]
        }
        else{
          obj[val].push(single.description.content)
        }  
      }
    }
    else{
      if (obj["OTHERS"]==null){
        obj["OTHERS"] = [single.description.content]
      }
      else{
        obj["OTHERS"].push(single.description.content)
      }
    }
  })
  // console.log(obj);
  return obj


}

//for seperating hotel images from room images

const hotelImages = (imgArr)=>{
  let obj ={}
  imgArr && imgArr.map((single)=>{
    if(single.roomCode){
      if (obj[single.roomCode]==null){
        obj[single.roomCode] = [single.path]
      }
      else{
        obj[single.roomCode].push(single.path)
      }
    }else{
      //998 => general images
      //999 => standard room images
      if (single.type.code=="HAB"){
        if (obj["STD_ROOMS"]==null){
          obj["STD_ROOMS"] = [single.path]
        }
        else{
          obj["STD_ROOMS"].push(single.path)
        }
      }
      else{
        if (obj["GEN"]==null){
          obj["GEN"] = [single.path]
        }
        else{
          obj["GEN"].push(single.path)
        }
      }
    }
  })
  return obj
}

//for hotelRooms
const hotelRooms= (dData,sData)=>{
  // console.log(dData);
  let arr=[]
  let flag =false
  for(let i=0;i<dData.length;i++){
    for(let j=0;j<sData.length;j++){
      if(dData[i].code == sData[j].roomCode){
        arr.push( {
          // dynamic data
          code:dData[i].code,
          name:dData[i].name,
          rates:dData[i].rates,
          // static data         
          chracteristics : sData.characteristic && sData[j].characteristic.description.content,
          minPax:sData[j].minPax,
          maxPax:sData[j].maxPax,
          maxAdults: sData[j].maxAdults,
          maxchildren: sData[j].maxChildren,
          minAdults: sData[j].minAdults,
          facilities: sData[j].roomFacilities && hotelFacilites(sData[j].roomFacilities),
          roomStays: sData[j].roomStays && sData[j].roomStays.map((single)=>{
            return {
              stayType: single.description,
              roomStayFacilities: single.roomStayFacilities && hotelFacilites(single.roomStayFacilities)
            }
          }),
        })
        break;
      }
    }
  }
  return arr
}

//for price RANDOM
function randomNumberGenerator(min,max){
   return Math.floor(Math.random()*(max-min+1)+min)
}
//FOR EACH HOTEL
const eachHotel=(dData,sData)=>{
  // console.log("fi;lterresponse each hotel");
    console.log(dData.code,"==",sData.code)
    // if (sData.rooms)
      return  {
       id:sData.code,
       type: sData.accommodationType.typeDescription,
       name:sData.name.content,
       description: sData.description.content,
       address: sData.address.content,
       city: sData.destination.name.content,
       state: sData.state.name,
       zone: sData.zone.name,
       country: sData.country.description.content,
       rating:returnRatingInInt(dData.categoryName),
       ranking: sData.ranking,
       reviewCount:randomNumberGenerator(100,5000),  //random data bcz api end-point yet to be found
       currency: dData.currency,
       email: sData.email,
       latitude: sData.coordinates.latitude,
       longitude: sData.coordinates.longitude,
       web: sData.web,
       phones: sData.phones,
       maxRate: dData.maxRate,
       minRate: dData.minRate,
       health_and_safety_rating: sData.S2C,
       images: {
         imgPath: [
                   "http://photos.hotelbeds.com/giata/",// For 320 pixel-wide images (standard size)
                   "http://photos.hotelbeds.com/giata/small/",// For 74 pixel-wide images (thumbnail size)
                   "http://photos.hotelbeds.com/giata/medium/",// For 117 pixel-wide images
                   "http://photos.hotelbeds.com/giata/bigger/",// For 800 pixel-wide images
                   "http://photos.hotelbeds.com/giata/xl/",// For 1024 pixel-wide images
                   "http://photos.hotelbeds.com/giata/xxl/",// For 2048 pixel-wide images
                   "http://photos.hotelbeds.com/giata/original/",//For images in its original size (please note that this is not a standard and actual size may vary between hotels)
               ],
         imgData:hotelImages(sData.images),
       },
       facilities:hotelFacilites(sData.facilities),
       rooms: dData.rooms && sData.rooms ? hotelRooms(dData.rooms,sData.rooms) : [],
       interestPoints: sData.interestPoints && sData.interestPoints.map((single)=>{ return [single.poiName,single.distance]}),
       wildCards: sData.wildcards && sData.wildcards.map((single)=>{ return {
         "roomType":single.roomType,
         "description":single.hotelRoomDescription.content
       }}),
       boardsAvailable: sData.boards && sData.boards.map((single)=>{return [single.code,single.description.content]}),
       segmentsAvailable: sData.segments&& sData.segments.map((single)=>{return single.description.content}),
  }     
}



exports.filterResponse= function(dData,sData){
  //dData = Dynamic data from availability endpoint
  //sData = Static data from content api endpoint
  return  eachHotel(dData,sData)
};





































          //   HotelRefId: data.code,
          //   // ChainCode: DBdata.chainCode,
          //   HotelName: data.name,
          //   // Rating: addRating(DBdata.code, codes),
          //   Rating:returnRatingInInt(data.categoryName),
          //   ReviewCount:randomNumberGenerator(100,5000),
          //   CityCode: data.destinationCode,
          //   Latitude: data.latitude,
          //   Longitude: DBdata.longitude,
          //   description:DBdata.description.content,
          //   HotelDistance: {
          //     terminals: DBdata.terminals,
          //     // Distance: 0.4,
          //     DistanceUnit: "KM"
          //   },
          //   Address: {
          //     Lines: [
          //       DBdata.address.content,
          //       DBdata.address.street,
          //       DBdata.address.number,
          //     ],
          //     CityName: DBdata.city.content,
          //     CountryCode: DBdata.countryCode
          //   },
          //   Contact: {
          //     "Phones" : DBdata.phones,
          //     "email"  : DBdata.email,
          //   },
          //   images: {
          //     imgPath:[
          //         "http://photos.hotelbeds.com/giata/",// For 320 pixel-wide images (standard size)
          //         "http://photos.hotelbeds.com/giata/small/",// For 74 pixel-wide images (thumbnail size)
          //         "http://photos.hotelbeds.com/giata/medium/",// For 117 pixel-wide images
          //         "http://photos.hotelbeds.com/giata/bigger/",// For 800 pixel-wide images
          //         "http://photos.hotelbeds.com/giata/xl/",// For 1024 pixel-wide images
          //         "http://photos.hotelbeds.com/giata/xxl/",// For 2048 pixel-wide images
          //         "http://photos.hotelbeds.com/giata/original/",//For images in its original size (please note that this is not a standard and actual size may vary between hotels)
          //     ],
          //     img: DBdata.images.map(single => single.path),
          //   },
          //   Amenities: [
          //     "HANDICAP_FAC",
          //     "ACC_BATHS",
          //     "ACC_WASHBASIN",
          //     "ACC_BATH_CTRLS",
          //     "ACC_LIGHT_SW",
          //     "ACC_ELEVATORS",
          //     "ACC_TOILETS",
          //     "SERV_DOGS_ALWD",
          //     "DIS_PARKG",
          //     "HANDRAIL_BTHRM",
          //     "ADAPTED_PHONES",
          //     "ADAPT_RM_DOORS",
          //     "ACC_RM_WCHAIR",
          //     "TV_SUB/CAPTION",
          //     "ACC_WCHAIR",
          //     "HANDRAIL_BTHRM",
          //     "EXT_ROOM_ENTRY",
          //     "EMERG_LIGHTING",
          //     "EXTINGUISHERS",
          //     "FIRE_SAFETY",
          //     "RESTRIC_RM_ACC",
          //     "SMOKE_DETECTOR",
          //     "SPRINKLERS",
          //     "KIDS_WELCOME",
          //     "ELEVATOR",
          //     "INT_HOTSPOTS",
          //     "FREE_INTERNET",
          //     "LAUNDRY_SVC",
          //     "NO_PORN_FILMS",
          //     "PARKING",
          //     "PETS_ALLOWED",
          //     "SWIMMING_POOL",
          //     "AIR_CONDITIONING",
          //     "KITCHEN",
          //     "NONSMOKING_RMS",
          //     "TELEVISION",
          //     "WI-FI_IN_ROOM"
          //   ],
          //   // Amenities : DBdata.facilities,
          //   WebUrl:DBdata.web,
          //   // Price:"$"+randomNumberGenerator(100,1500),
          //   minPrice:data.minRate,
          //   maxPrice:data.maxRate,
          //   currency:data.currency,
          //   like:false,
          //   saleOff:randomNumberGenerator(1,20)+"% today",
          //   rooms:data.rooms

          //   // DOUBT
          // // Available: true,
          // // IsAffiliatedVendor:true,
          // // RedirectUrl:"http://pdt.multimediarepository/book",
          // //     ApiVendorUId:"asdfghBdMwhq8Q2BKAGZwl354647",
          // //     TotalPrice: 143937.52,
          // //     BasePrice: 90373.52,
          // //     TotalTax: 53564,
          // //     Currency:"USD",
          // //     IsRefundable: false,
          // //     IsBookable: true,
          // //     ChangePenalty:
          // //     {
          // //         Amount: 2626,
          // //         ChangePenaltyType: 1,
          // //         ChangePenaltyApplies: "Anytime",
          // //     },
          // //     CancelPenalty:
          // //     {
          // //       Amount: 100,
          // //       CancelPenaltyType: 0,
          // //       CancelPenaltyApplies: "Anytime",
          // //     }