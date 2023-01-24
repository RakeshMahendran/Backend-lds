const mongoose = require('mongoose')

const phone_schema = mongoose.Schema({
    phoneNumber :{
        type : String
    },
    phoneType:{
        type: String
    }
})

const  hotel_details = mongoose.Schema({
      code:{
        type:Number
      },
      name: {
        type: String
      },
      address: {
        type: String
      },
      city: {
        type: String
      },
      ranking: {
        type: Number
      },
      rating: {
        type: String 
      },
      phones: {
        type: [
            phone_schema
        ]
    },
    images: {
        imgPath:{
            type: [
                String
            ]
        },
        imgData: {
            type: Object
        }
    },
    facilities: {
        type: Object
    }
         
},{timestamps:true})

module.exports=mongoose.model('HotelDetails',hotel_details)