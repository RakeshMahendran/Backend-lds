const express = require('express');
const router = express.Router();

//mongo user model
const { User} = require("../models/userModel");

//Password handler
const bcrypt = require('bcrypt')

// mongodb user otp verification model
const userOTPVerification = require('../models/userOTPVerification')


// for verification mail
const Token = require('../models/UserToken');
const sendEmail = require('../controllers/sendEmail');
const crypto = require('crypto');


//import validationSchema
const {signUpBodyValidation } = require('../utils/validationSchema');



// env variables
require("dotenv").config();

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

//Sign up
const signup = async (req,res) => {
  
       try {
		const { error } = signUpBodyValidation(req.body);
		if (error)
			return res
				.status(400)
				.json({ error: true, message: error.details[0].message });

		const user = await User.findOne({ email: req.body.email });
		if (user)
			return res
				.status(400)
				.json({ error: true, message: "User with given email already exist" });

		const salt = await bcrypt.genSalt(Number(process.env.SALT));
		const hashPassword = await bcrypt.hash(req.body.password, salt);

		await new User({ ...req.body, password: hashPassword }).save();

		res
			.status(201)
			.json({ error: false, message: "Account created sucessfully" });
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: true, message: "Internal Server Error" });
	}
}


// const sendOTPVerificationEmail = async ({ _id, email}, res) => {
//   try{
//     const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    
//     //mail options
//     const mailOptions = {
//         from: process.env.AUTH_EMAIL,
//         to: email,
//         subject: 'Verify your email',
//         html: `<p> Enter <b>${otp}</b>in the app to verify your email address</p>
//         <p>This code expires in 1 hour</p>`
//     }
   
//     //hash the otp 
//      const saltRounds = 10;

//      const hashedOTP = await bcrypt.hash(otp, saltRounds);
//      const newOTPVerification = await new userOTPVerification({
//         userId: _id,
//         otp: hashedOTP,
//         createdAt: Date.now(),
//         expiresAt: Date.now() + 3600000,
//      });


//      // save otp record
//      await newOTPVerification.save();
//      await transporter.sendMail(mailOptions);
//      res.json({
//         status: "PENDING",
//         message: "Verify  otp email send",
//         data: { 
//             userId: _id,
//             email,
//         },
//      })
    
// } catch(error){
//      res.json({
//         status: "FAILED",
//         message: error.message
//      })
//   }
// };


// router.get("/:id/verify/:token/", async (req, res) => {
// 	try {
// 		const user = await User.findOne({ _id: req.params.id });
// 		if (!user) return res.status(400).send({ message: "Invalid link" });

// 		const token = await Token.findOne({
// 			userId: user._id,
// 			token: req.params.token,
// 		});
// 		if (!token) return res.status(400).send({ message: "Invalid link" });

// 		await User.updateOne({ _id: user._id, verified: true });
// 		await token.remove();

// 		res.status(200).send({ message: "Email verified successfully" });
// 	} catch (error) {
// 		res.status(500).send({ message: "Internal Server Error" });
// 	}
// });

module.exports = router;

module.exports = { signup }


