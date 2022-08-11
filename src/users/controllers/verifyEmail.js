const express = require('express');
const router = express.Router();

//mongo user model
const { User } = require("../models/userModel");

// for verification mail
const Token = require('../models/UserToken');

// env variables
require("dotenv").config();

const verifyEmail = async (req, res) => {
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
};

module.exports = { verifyEmail };