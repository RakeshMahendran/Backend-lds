const express = require('express');
const router = express.Router();

const {createCheckout} = require('../src/booking/controller/checkout')
const {BookingDetails}=require("../src/booking/controller/bookingDetails")


router.post('/api/checkout-session/:userId',createCheckout)

router.get('/api/BookingDetails/:bookingId',BookingDetails)

router.param('userId',(req,res,next,id)=>{
    req.userId=id;
    next();
})

router.param('bookingId',(req,res,next,id)=>{
    req.bookingId=id;
    next();
})

//request to this route with itinearyid to make the actual booking

router.post('api/booking',)

module.exports=router;