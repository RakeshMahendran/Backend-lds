const express = require('express');
const router = express.Router();
const auth = require( "../middleware/auth.js")
const roleCheck = require("../middleware/roleCheck.js");



const userDetails=  (auth,(req, res) => {
	res.status(200).json({ message: "user authenticated." });
});

module.exports = userDetails