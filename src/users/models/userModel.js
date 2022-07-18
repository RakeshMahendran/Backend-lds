const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

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
   verified:{ 
        type: Boolean,
        // required: true,
    }
});
const User = mongoose.model("user", userSchema);

userSchema.methods.generateAuthToken = function () {
	const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY, {
		expiresIn: "7d",
	});
	return token;
};

const validate = (data) => {
	const schema = Joi.object({
		firstName: Joi.string().required().label("First Name"),
		lastName: Joi.string().required().label("Last Name"),
		email: Joi.string().email().required().label("Email"),
		password: passwordComplexity().required().label("Password"),
	});
	return schema.validate(data);
};

module.exports = { User, validate };


/*



*/