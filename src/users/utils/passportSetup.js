// const passport = require("passport");
// const GoogleStrategy = require('passport-google-oauth20').Strategy;

// passport.use(
// 	new GoogleStrategy(
// 		{
// 			clientID: process.env.CLIENT_ID,
// 			clientSecret: process.env.CLIENT_SECRET,
// 			// callbackURL: "https://www.travelfika.com",
// 			callbackURL: "http://localhost:3000",
// 			scope: ["profile", "email"],
// 			passReqToCallback: true
// 		},
// 		// function (accessToken, refreshToken, profile, cb) {
// 		// 	// console.log("-------------------------------------",profile);
// 		// 	cb(null, profile);
// 		// }
// 		function (req, token, refreshToken, profile, done) {
// 			// console.log('here is res.locals.user'+ res.locals.user);
// 			console.log('here is req.user' + req.user);

// 		}
// )
// );

// passport.serializeUser((user, done) => {
// 	return done(null, user);
// });

// passport.deserializeUser((user, done) => {
// 	return done(null, user);
// });

const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");

const GOOGLE_CLIENT_ID = "61562253305-hpk7bbfbbh146k9bb1vq02addn7p1n3d.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";

// CLIENT_ID=61562253305-hpk7bbfbbh146k9bb1vq02addn7p1n3d.apps.googleusercontent.com
// CLIENT_SECRET=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

passport.use(
	new GoogleStrategy(
		{
			clientID: GOOGLE_CLIENT_ID,
			clientSecret: GOOGLE_CLIENT_SECRET,
			callbackURL: "/google/callback",
			scope: ["profile", "email"],
		},
		function (accessToken, refreshToken, profile, callback) {
			callback(null, profile);
		}
	)
);

passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser((user, done) => {
	done(null, user);
});

