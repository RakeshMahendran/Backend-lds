const express = require('express');
const router = express.Router();

const {createCheckout} = require('../src/booking/controller/checkout')
const {BookingDetails}=require("../src/booking/controller/bookingDetails")
const {initiateBooking}=require('../src/booking/controller/initiateBooking')


router.post('/api/checkout-session/:userId',createCheckout)

router.get('/api/BookingDetails/:bookingId',BookingDetails)

router.get('/api/v1/flight/process-booking/:bookingId',initiateBooking)

router.param('userId',(req,res,next,id)=>{
    req.userId=id;
    next();
})

router.param('bookingId',(req,res,next,id)=>{
    req.bookingId=id;
    console.log('[+]booking id ',req.bookingId)
    next();
})

//request to this route with itinearyid to make the actual booking



module.exports=router;