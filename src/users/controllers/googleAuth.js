
const router = require("express").Router();
const passport = require("passport");
const generateTokens = require('../utils/generateToken');

//mongo user model
const { User } = require('../models/userModel')

router.get("/api/v1/login/success", async (req, res) => {

	try {
		if (req.user) {
			// console.log(req.user)

			const user = await User.findOne({ email: req.user._json.email });
			console.log(req.user)
			if (user) {
				var { accessToken, refreshToken } = await generateTokens(user);

				console.log("Google sign up-----", accessToken)


				return res.status(200).json({
					error: false,
					accessToken,
					refreshToken,
					message: "Successfully Logged In",
					user: req.user,
					userId: user._id,
				});
			} 

			const userNew = await new User({ firstName: req.user._json.given_name, lastName: req.user._json.family_name, email: req.user._json.email, userId: user._id}).save();

			console.log(userNew);
			// return res
			// 	.status(201)
			// 	.json({ error: false, message: "Account created sucessfully" });

			var { accessToken, refreshToken } = await generateTokens(userNew);

			// console.log("Google sign up")
			return res.status(200).json({
				error: false,
				accessToken,
				refreshToken,
				message: "Successfully Logged In",
				user: req.user,
				userId: user._id,
			});




		} else {
			res.status(403).json({ error: true, message: "Not Authorized" });
		}
	} catch (error) {
		console.log(error)
	}
});

router.get("/api/v1/login/failed", (req, res) => {
	res.status(401).json({
		error: true,
		message: "Log in failure",
	});
});

router.get("/api/v1/google", passport.authenticate("google", ["profile", "email"]));

router.get(
	"/api/v1/google/callback",
	// "auth/google/callback",
	passport.authenticate("google", {
		// successRedirect: "http://localhost:3000/",
		successRedirect: "https://www.travelfika.com",
		failureRedirect: "/api/v1/login/failed",
	})
);

router.get("/api/v1/logout", (req, res) => {
	req.logout();
	// res.redirect("http://localhost:3000/");
	res.redirect("https://www.travelfika.com");
	
});

module.exports = router;
