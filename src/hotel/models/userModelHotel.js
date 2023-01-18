const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

// env variables
require("dotenv").config();


const addressSchemaHotel = new Schema({
      number: { type: String, default: null },
      city: { type: String, default: null },
      state: { type: String, default: null },
      country: { type: String, default: null }
})

const userSchemaHotel = new Schema(
    {
    firstName: {
        type: String,
        // required: true,
    },
    lastName: {
        type: String,
        // required: true,
    },
    email: {
        type: String,
        required: [true, 'Provide Email']
   },
    password: {
    type: String,
    // required: [true, 'Provide password']
   },
   role:{
    type:Number,
    default:0
    //registered user, guest user,
   },
     token:{ 
      type: String 
    },
    countryCode: {
         type: String,
    },
    phoneNo: {
        type: String,
    },
    country: { 
        type: String,
    },
    address: {
        type: addressSchemaHotel,
    },
    pic: {
      type: String,
     // required: true,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
   verified:{ 
        type: Boolean,
        // required: true,
    },
}, { 
    timestamps : true,
   }
);

const UserHotel = mongoose.model("user", userSchemaHotel);

module.exports = { UserHotel};


/*



*/