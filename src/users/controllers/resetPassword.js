
const express = require('express');
const router = express.Router();


// mongodb user reset password model
const passwordReset = require('../models/passwordReset')
const { User, validate } = require('../models/userModel')

//Password handler
const bcrypt = require('bcryptjs')

// email handler
const nodemailer = require("nodemailer");

//unique string
const { v4: uuidv4 } = require("uuid");


// Nodemailer stuff
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    },
});

// testing success 

transporter.verify((error, success) => {
    if (error) {
        console.log(error)
    } else {
        console.log("Ready for messages");
        console.log(success);
    }
})


// reset the password

const resetPassword = async (req, res) => {
    let { id, token, password } = req.body;
    let userId = id;
    let resetString = token;
    let newPassword = password;
    passwordReset
        .find({ userId: id })
        .then(result => {
            console.log(result);
            if (result.length > 0) {
                // password reset record exists so we proceed
                const { expiresAt } = result[0];
                const hashedString = result[0].resetString;
                //checking for expired reset string
                if (expiresAt < Date.now()) {
                    passwordReset
                        .deleteOne({ userId })
                        .then(() => {
                            //Reset record deleted successfully
                            res.json({
                                status: "FAILED",
                                message: "Password reset link has expired.",
                            })
                        })
                        .catch(error => {
                            //Deletion failed
                            console.log(error);
                            res.json({
                                status: "FAILED",
                                message: error.message
                            })
                        })
                } else {
                    //valid reset record exists so we validate the reset string
                    //first compare the hashed reset string 
                    bcrypt
                        .compare(resetString, hashedString)
                        .then(async (result) => {
                            if (result) {
                                // strings matched 
                                // hash password again
                                const salt = await bcrypt.genSalt(Number(process.env.SALT));
                                const hashNewPassword = await bcrypt.hash(newPassword, salt);

                                console.log("hello");
                                User
                                    .updateOne({ _id: userId }, { password: hashNewPassword })
                                    .then(() => {
                                        //update complete. Now delete reset record

                                        passwordReset
                                            .deleteOne({ userId })
                                            .then(() => {
                                                // both user record and reset record updated
                                                res.json({
                                                    status: 'success',
                                                    message: 'Password reset successfully'
                                                })
                                            })
                                            .catch((error) => {
                                                console.log(error);
                                                res.json({
                                                    status: "FAILED",
                                                    message: "An error occurred while finalizing password reset."
                                                })
                                            })
                                    })

                                    .catch(error => {
                                        console.log(error);
                                        res.json({
                                            status: "FAILED",
                                            message: "An error occurred while updating new password"

                                        })
                                    })
                            } else {
                                // Existing record but incorrect reset string passed.
                                res.json({
                                    status: "FAILED",
                                    messages: "Invalid password reset details passed",
                                })
                            }
                        })
                        .catch((error) => {
                            console.log("***************", error);
                            res.json({
                                status: "FAILED",
                                message: "Comparing password reset strings failed",
                            })
                        })

                }
            } else {
                // Password reset request doesn't exist
                res.json(
                    {
                        status: "FAILED",
                        message: "Password reset request not found"
                    }
                )
            }
        })

        .catch(error => {
            console.error(error);
            res.json({
                status: "FAILED",
                message: message.error
            })
        })

                }

module.exports = { resetPassword }
