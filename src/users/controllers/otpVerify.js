const express = require('express');
const router = express.Router();

//mongo user model
const { User, validate } = require('../models/userModel')
// mongodb user otp verification model
const userOTPVerification = require('../models/userOTPVerification')


//Password handler
const bcrypt = require('bcrypt')

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


//otp verification

const OTPverify = async (req, res) => {
    try{
       
        let { userId, otp } = req.body;

        if (!userId || !otp) {
            throw  Error("Empty otp details are not allowed");
            } else {
            const userOTPVerificationRecords = await userOTPVerification.find({ 
                  userId,
            });
            if (userOTPVerificationRecords.length <= 0) {
                // no record found
                throw new Error("Account record doesn't exist or has been verified already. Please sign up or log in."
                );
            } else {
                // user otp record exists
                const expiresAt = userOTPVerificationRecords[0];
                const hashedOTP = userOTPVerificationRecords[0].otp;

                if (expiresAt < Date.now()) {
                    //user otp record has expired
                    await userOTPVerification.deleteMany({ userId });
                    throw new Error ("Code has expired. Please request again")
                } else {
                    const validOTP = bcrypt.compare(otp, hashedOTP);


                    if (!validOTP) {
                        // supplied otp is wrong
                        throw new Error ("Invalid code passed.Check your inbox");
                    } else {
                        //success
                        await User.updateOne({ _id: userId}, { verified: true});
                        await userOTPVerification.deleteMany({ userId });
                        res.json({
                          status: "VERIFIED",
                          message: `User email verified successfully.`,
                        });
                    }
                }
            }
        }
    } catch (error) {
        res.json({
            status:"FAILED",
            message: error.message,
        })
    }
};

module.exports = { OTPverify }