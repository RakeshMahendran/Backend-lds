const express = require('express');
const router = express.Router();

const {createCheckout} = require('../src/booking/controller/checkout')
const {book}=require("../src/booking/controller/booking")

router.post('/api/checkout-session/:userId',createCheckout)

router.param('userId',(req,res,next,id)=>{
    req.userId=id;
    next();
})

//request to this route with itinearyid to make the actual booking

router.post('api/booking',)

module.exports=router;