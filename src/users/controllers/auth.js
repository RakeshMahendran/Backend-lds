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
const { generateTokens } = require('../utils/generateToken');


const login = async (req, res) => {
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

		const verifiedPassword = await bcrypt.compare(
			req.body.password,
			user.password
		);
		if (!verifiedPassword)
			return res
				.status(401)
				// .send({ message: "Invalid password" });
				.json({ error: true, message: "Invalid password" });

		const { accessToken, refreshToken } = await generateTokens(user);


		res.status(200).json({
			error: false,
			user: user.firstName,
			accessToken,
			refreshToken,
			message: "Logged in sucessfully",
		});

	} catch (err) {
		console.log(err);
		res.status(500).json({ error: true, message: "Internal Server Error" });
	}

};

module.exports = { login };


