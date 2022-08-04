const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

//env variables
const dotenv = require("dotenv");
dotenv.config();

//mongo user model
const { User } = require('../models/userModel')

//Password handler
const bcrypt = require('bcryptjs')

//import validationSchema
const { logInBodyValidation } = require("../utils/validationSchema"
)

//generate token function from utils
const generateTokens =require( '../utils/generateToken');


<<<<<<< HEAD
const  login = async (req, res) => {
	//Authenticate user
try {
		const { error } = logInBodyValidation(req.body);
		if (error)
			return res
				.status(400)
				.json({ error: true, message: error.details[0].message });

		const user = await User.findOne({ email: req.body.email });
		if (!user)
			return res
				.status(401)
				.json({ error: true, message: "Invalid email or password" });
		

		

		// const verifiedPassword = await bcrypt.compare(
		// 	req.body.password,
		// 	user.password
		// );
		// if (!verifiedPassword)
		// 	return res
		// 		.status(401)
		// 		.send({ message: "Invalid password" });

		const { accessToken, refreshToken } = await generateTokens(user);

		res.status(200).json({
			error: false,
			accessToken,
			refreshToken,
			message: "Logged in sucessfully",
		});
	
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: true, message: "Internal Server Error" });
	}
     
};

=======
<<<<<<< HEAD
<<<<<<< HEAD
		const token = user.generateAuthToken();
		res.status(200).send({ data: token, message: "logged in successfully" });
	} catch (error) {
		console.log(error);
		res.status(500).send({ message: "Internal Server Error" });
	}
};
=======
=======
>>>>>>> d75d76c0419c7ddd5c8f674a626d6b63328c3e82
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
  
<<<<<<< HEAD
>>>>>>> d75d76c0419c7ddd5c8f674a626d6b63328c3e82
=======
>>>>>>> d75d76c0419c7ddd5c8f674a626d6b63328c3e82
>>>>>>> e9b6be29da7f68ea82ec13914165ec6ae49b8616

module.exports = {login};


