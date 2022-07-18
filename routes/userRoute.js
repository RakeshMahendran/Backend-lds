const express = require('express');
const router = express.Router();


//user from controllers
const user = require("../src/users/controllers/user");

// auth from controllers
const auth = require("../src/users/controllers/auth");

// otp verify from controllers
const otpVerify  = require("../src/users/controllers/otpverify"); 

//reset password from controllers
const request = require("../src/users/controllers/requestPassword")

// resend otp from controllers
const resend = require("../src/users/controllers/resendOTP")

//reset password from controllers
const reset = require("../src/users/controllers/resetPassword")

//login and signup
router.post('/api/v1/auth/login', (auth.login));
router.post('/api/v1/auth/signup', (user.signup));

//reset password route
router.post('/api/v1/auth/requestPassword', (request.requestPassword));
router.post('/api/v1/auth/resetPassowrd', (reset.resetPassword))

//otp verification route
router.post('/api/v1/auth/otpVerify', (otpVerify.OTPverify))
router.post('/api/v1/auth/resendOTP', (resend.resendOTP));

module.exports= router;
