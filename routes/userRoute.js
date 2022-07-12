const express = require('express');
const router = express.Router();

const auth = require("../src/users/controllers/auth");


router.post('/api/v1/auth/login', (auth.login))


module.exports = router;
