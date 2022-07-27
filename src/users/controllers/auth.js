const express = require('express');
const router = express.Router();

//mongo user model
const { User, validate } = require('../models/userModel')

//Password handler
const bcrypt = require('bcrypt')

//login user
const login = async (req, res) => {
        
	  let {email, password} = req.body;
    email = email.trim();
    password = password.trim();


	 if ( email == "" || password == "")  {
        res.json ({
            status: "FAILED",
            message: "Empty credentials supplied!"
        });
	} else{
		// Check if user exists
		User.find({email}).
		then(data => {
			if (data.length) {
				// user exists
				
				const hashedPassword = data[0].password;
			    bcrypt.compare(password, hashedPassword).then(result => {
					if (result) {
						//Password match
						res.json({
							status: "SUCCESS",
							message: "Signing in successfully",
							data: data
						})
					} else {
						res.json({
							status: "FAILED",
							message: "Invalid password entered"
						})
					}
				})
				.catch(err => {
					res.json({
						status: "FAILED",
						message: err.message
					})
				})
			} else {
				res.json({
					status: "FAILED",
					message: "Invalid Credentials entered!"
				})
			}
		})
		.catch(err => {
			res.json({
				status: "FAILED",
				message: err.message
			})
		})
	}}
  

module.exports = {login};
