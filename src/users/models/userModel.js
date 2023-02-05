const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

// env variables
require("dotenv").config();

const userSchema = new Schema(
    {
    firstName: {
        type: String,
      // required: true,
    },
    lastName: {
        type: String,
       // required: true
    },
    collegeName: {
        type: String,
       // required: true
    },
    email: {
        type: String,
        required: [true, 'Provide Email']
   },
    password: {
    type: String,
    // required: [true, 'Provide password']
   },
   
//    phoneNo: {
//         type: String,
//     },
//    verified:{ 
//         type: Boolean,
//         // required: true,
//     },
}, { 
    timestamps : true,
   }
);

const User = mongoose.model("user", userSchema);

module.exports = { User};
