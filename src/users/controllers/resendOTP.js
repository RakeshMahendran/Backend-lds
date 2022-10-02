const express = require('express');
const router = express.Router();

//mongo user model
const { User, validate } = require('../models/userModel')
// mongodb user otp verification model
const userOTPVerification = require('../models/userOTPVerification')


//Password handler
const bcrypt = require('bcryptjs')

// email handler
const nodemailer = require("nodemailer");

// Nodemailer stuff
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    auth:{
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    },
});

// testing success 

  transporter.verify((error,success) => {
    if(error){
        console.log(error)
    } else {
        console.log("Ready for messages");
        console.log(success);
    }
})


//send otp verification email

const sendOTPVerificationEmail = async ({ _id, email}, res) => {
  try{
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    
    //mail options
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: 'Verify your email',
        html: `<p> Enter <b>${otp}</b>in the app to verify your email address</p>
        <p>This code expires in 1 hour</p>`
    }
   
    //hash the otp 
     const saltRounds = 10;

     const hashedOTP = await bcrypt.hash(otp, saltRounds);
     const newOTPVerification = await new userOTPVerification({
        userId: _id,
        otp: hashedOTP,
        createdAt: Date.now(),
        expiresAt: Date.now() + 3600000,
     });


     // save otp record
     await newOTPVerification.save();
     await transporter.sendMail(mailOptions);
     res.json({
        status: "PENDING",
        message: "Verify  otp email send",
        data: { 
            userId: _id,
            email,
        },
     })
    
} catch(error){
     res.json({
        status: "FAILED",
        message: error.message
     })
  }
};






//resend OTP

const resendOTP = async(req, res) => {
    try{
        let { userId, email } = req.body;

        if(!userId || !email) {
            throw Error("Empty user details are not allowed");
        } else {
            // delete existing records and resend
            await userOTPVerification.deleteMany({  userId });
            sendOTPVerificationEmail({ _id: userId, email}, res);
        }
    } catch(error) {
       res.json({ 
        status: "FAILED",
        message: error.message,
       })
    }
}

module.exports ={ resendOTP }