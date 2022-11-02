const passport = require("passport"); 
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.serializeUser((user, done) => {
	return done(null, user);
});

passport.deserializeUser((user, done) => {
	return done(null, user);
});


passport.use(
	new GoogleStrategy(
		{
		    clientID: process.env.CLIENT_ID,
			clientSecret: process.env.CLIENT_SECRET,
			callbackURL: "https://www.travelfika.com",
			//scope: ["email","profile"],
			//passReqToCallback:true
		},
		function (accessToken, refreshToken, profile, cb) {
			console.log(profile);
			cb(null, profile);
		}
	)
);
