const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const addressSchema = new Schema({
      number: { type: String, default: null },
      city: { type: String, default: null },
      state: { type: String, default: null },
      country: { type: String, default: null }
})

const userSchema = new Schema({
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    email: {
        type: String,
        required: [true, 'Provide Email']
   },
    password: {
    type: String,
    required: [true, 'Provide password']
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
    type: addressSchema,
  },
});
    
const userModel = mongoose.model("userModel", userSchema);

module.exports =  userModel;

const Joi = require('joi');


const User = mongoose.model('User', new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    }
}));

function validateUser(user) {
    const schema = {
        name: Joi.string().min(5).max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required()
    };
    return Joi.validate(user, schema);
}

exports.User = User;
exports.validate = validateUser;
