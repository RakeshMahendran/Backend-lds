const express = require('express');
const router = express.Router();
const UserToken = require("../models/UserToken.js");
const jwt = require('jsonwebtoken');
const verifyRefreshToken = require("../utils/verifyRefreshToken.js");
const { refreshTokenBodyValidation } = require( "../utils/validationSchema.js");



// get new access token
const refreshToken = async (req, res) => {
	const { error } = refreshTokenBodyValidation(req.body);
	if (error)
		return res
			.status(400)
			.json({ error: true, message: error.details[0].message });

	verifyRefreshToken(req.body.refreshToken)
		.then(({ tokenDetails }) => {
			const payload = { _id: tokenDetails._id, roles: tokenDetails.roles };
			const accessToken = jwt.sign(
				payload,
				process.env.ACCESS_TOKEN_PRIVATE_KEY,
				{ expiresIn: "14m" }
			);
			res.status(200).json({
				error: false,
				accessToken,
				message: "Access token created successfully",
			});
		})
		.catch((err) => res.status(400).json(err));
};

const logout =  async (req, res) => {
	try {
		const { error } = refreshTokenBodyValidation(req.body);
		if (error)
			return res
				.status(400)
				.json({ error: true, message: error.details[0].message });

		const userToken = await UserToken.findOne({ token: req.body.refreshToken });
		if (!userToken)
			return res
				.status(200)
				.json({ error: false, message: "Logged Out Sucessfully" });

		await userToken.remove();
		res.status(200).json({ error: false, message: "Logged Out Sucessfully" });
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: true, message: "Internal Server Error" });
	}
};



module.exports =  { refreshToken, logout }