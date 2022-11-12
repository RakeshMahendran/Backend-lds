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
   const { email } = req.body
   let redirectUrl = process.env.BASE_URL
   console.log(redirectUrl);
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
        subject: 'Password reset',
        html: `<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
        <!--100% body table-->
        <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
            style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
            <tr>
                <td>
                    <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                        align="center" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="height:80px;">&nbsp;</td>
                        </tr>
                        <tr>
                            <td style="height:20px;">&nbsp;</td>
                        </tr>
                        <tr>
                            <td>
                                <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                    style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                    <tr>
                                        <td style="height:40px;">&nbsp;</td>
                                    </tr>
                                    <tr>
                                        <td style="padding:0 35px;">
                                            <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Not to worry, we got you!</h1>
                                            <span
                                                style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                            <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                To reset your password, click the button below. For security reasons, <b>this link will expire in 1 hours.</b>
                                            </p>
                                            <a href=${
                process.env.BASE_URL + "/reset-password/" + _id + "/" + resetString
            } style="background:#E1A658;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Reset Password</a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:0 35px;">
                                        <br/>
                                        <br/><br/>
                                        <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                If you do not need to reset your password, please ignore this email and your password will stay the same.
                                            </p>                                        
                                        </td>
                                    </tr>                               
                                    <tr>
                                        <td style="height:40px;">&nbsp;</td>
                                    </tr>
                                </table>
                            </td>
                        <tr>
                            <td style="height:20px;">&nbsp;</td>
                        </tr>
                        <tr>
                            <td style="text-align:center;">
                                <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; <strong>www.travelfika.com</strong></p>
                            </td>
                        </tr>
                        <tr>
                            <td style="height:80px;">&nbsp;</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        <!--/100% body table-->
    </body>`,
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


