const express = require('express');
const router = express.Router();

//mongo user model
const { User, validate } = require("../models/userModel");

//Password handler
const bcrypt = require('bcrypt')

// mongodb user otp verification model
const userOTPVerification = require('../models/userOTPVerification')


// for verification mail
const Token = require('../models/token');



// env variables
require("dotenv").config();

 

router.get("/:id/verify/:token/", async (req, res) => {
	try {
		const user = await User.findOne({ _id: req.params.id });
		if (!user) return res.status(400).send({ message: "Invalid link" });

		const token = await Token.findOne({
			userId: user._id,
			token: req.params.token,
		});
		if (!token) return res.status(400).send({ message: "Invalid link" });

		await User.updateOne({ _id: user._id, verified: true });
		await token.remove();

		res.status(200).send({ message: "Email verified successfully" });
	} catch (error) {
		res.status(500).send({ message: "Internal Server Error" });
	}
});

module.exports = router;