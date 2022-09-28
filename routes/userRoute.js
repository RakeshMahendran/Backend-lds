const express = require('express');
const router = express.Router();


//user from controllers
const user = require("../src/users/controllers/user");
const updateUser = require("../src/users/controllers/updateUser")
// auth from controllers
const auth = require("../src/users/controllers/auth");

//refresh user
const refresh = require("../src/users/controllers/refreshToken")

const userDetails = require("../src/users/controllers/users")

// otp verify from controllers
const otpVerify  = require("../src/users/controllers/otpverify"); 

//reset password from controllers
const request = require("../src/users/controllers/requestPassword")

// resend otp from controllers
const resend = require("../src/users/controllers/resendOTP")

//reset password from controllers
const reset = require("../src/users/controllers/resetPassword")

//verify email from controllers
const verification = require("../src/users/controllers/verifyEmail")

const {listUser} = require("../src/users/controllers/listUser")

//Signup, Login , Logout , Refreshtokens
router.post('/api/v1/auth/login', (auth.login));
router.post('/api/v1/auth/signup', (user.signup));
router.post('/api/v1/auth/profile', (updateUser.updateUserProfile));
router.post('/api/v1/auth/refreshToken',(refresh.refreshToken) )
router.delete('/api/v1/auth/logout', (refresh.logout))

//List all the user
router.get('/api/v1/user/list',listUser)

router.get('/api/v1/auth/details',(userDetails))

//reset password route
router.post('/api/v1/auth/requestPassword', (request.requestPassword));
router.post('/api/v1/auth/resetPassowrd', (reset.resetPassword))



//otp verification route
//router.post('/api/v1/auth/otpVerify', (otpVerify.OTPverify))
//router.post('/api/v1/auth/resendOTP', (resend.resendOTP));

//verify Email 
router.get('/api/v1/auth/:id/verify/:token', (verification.verifyEmail))

module.exports= router;
