const express = require('express');
const router = express.Router();

const user = require("../src/users/controllers/user");
const auth = require("../src/users/controllers/auth");


router.post('/api/v1/auth/login', (auth.login))
router.post('/api/v1/auth/signup', (user.signup))





module.exports = router;
