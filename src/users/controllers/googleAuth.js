const router = require("express").Router();
const passport = require("passport");


router.get("/auth/google", passport.authenticate("google",{ scope: [ "profile"] }
 //["profile", "email"]
 ));
router.get("/login/success", (req, res) => {
	if (req.user) {
		res.status(200).json({
			error: false,
			message: "Successfully Loged In",
			user: req.user,
            cookies: req.cookies
		});
	} else {
		res.status(403).json({ error: true, message: "Not Authorized" });
	}
});

router.get("/login/failed", (req, res) => {
	res.status(401).json({
		error: true,
		message: "Log in failure",
	});
});



router.get(
	"/auth/google/callback",
	passport.authenticate("google", {
		///successRedirect: process.env.CLIENT_URL,
		failureRedirect: "/login", session:true, 
		function (req, res) {
			//Successful authentication , redirect home
			res.redirect('/');
		}
	})
);

router.get("/logout", (req, res) => {
	req.logout();
	res.redirect(process.env.CLIENT_URL);
});

router.get("/hello", (req,res) => {
    res.send("Hello");
})

module.exports = router;