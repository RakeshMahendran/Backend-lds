const express = require('express');
const router = express.Router();


const { User, validate } = require('../models/userModel')

// mongodb user reset password model
const passwordReset = require('../models/passwordReset')


//Password handler
var bcrypt = require('bcryptjs')

// email handler
const nodemailer = require("nodemailer");

//unique string
const { v4: uuidv4} = require("uuid");


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



//request Password Reset
const requestPassword = async (req, res) => {
   const { email, redirectUrl } = req.body
   //check if email exists
    User
   .find({email})
   .then((data) => {        
         if(data.length) {
        // user exists
        // check if user is verified
                  if(data[0].verified) { //updated by Agilan
                       res.json({ 
                       status:"FAILED",
                       message: "Email hasn't been verified yet. Check your inbox",
                     });
                  } else{
                    // proceed with emaik to reset password
                     sendResetEmail(data[0], redirectUrl, res);
                  }
        } else {
                     res.json({ 
                     status: "FAILED",
                      message: "No account with the supplied email exists",
                      });
        }    
   })
   .catch (error => {
       console.log(error);
       res.json({ 
        status: "FAILED",
        message: error.message 
       });
    })
};
//send password reset Email

const sendResetEmail = ({_id,email }, redirectUrl, res) => {
    const resetString = uuidv4() + _id;
  
   // first, we clear all existing reset records
    passwordReset
    .deleteMany({ userId: _id})
    .then((result)=> {
        // Reset records deleted successfully
        // Now we send the email

     //mail options
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: 'Password Reset',
        html: `<p>We heard that you lost the password.</p>
        <p>Don't worry, use the link below to reset it</p>
        <p>This link <b> expires in 60 minutes</b>.</p>
        <p>Press <a href=${
            "http://localhost:3000" + "/reset-password/" + _id + "/" + resetString
        }> here</a> to proceed.</p>
        <p>This code expires in 1 hour</p>`,
    }
   
    // hash the reset string 
    const saltRounds =10
    bcrypt
    .hash(resetString, saltRounds)
    .then(hashedResetString => {
        // set values to password reset calculator

        const newPasswordReset = new passwordReset({
            userId: _id,
            resetString: hashedResetString,
            createdAt: Date.now(),
            expiresAt: Date.now()+ 3600000,
        })
      newPasswordReset
      .save()
      .then(() => {
            transporter
            .sendMail(mailOptions)
            .then(() => {
                //reset email sent and password reset record saved
                res.json({
                    status: 'PENDING',
                    message:"Password reset email sent",
                })
          }).catch (error => {
                console.log(error)
                res.json({
                    status: "FAILED",
                    message: "Password reset email failed",
                })
            })
       .catch (error => {
               console.log(error);
                 res.json({ 
                     status: "FAILED",
                     message: "Couldn't save password reset data",
        })
        })
    .catch(error => {
        console.log(error);
        res.json({
            status: "FAILED",
            message: "An error occurred while hashing the reset data!",
        })        
.catch((error) => {
        // error while clearing existing records
        console.log(error);
        res.json({ 
            status: "FAILED",
            message: "Clearing existing password reset records failed",
        });
        })
    })
    })
} 
  )}

    )}

module.exports = { requestPassword }


