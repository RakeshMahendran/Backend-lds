const express = require('express');
const router = express.Router();


const {createCheckout} = require('../src/booking/controller/checkout')
const {BookingDetails}=require("../src/booking/controller/bookingDetails")
const {initiateBooking}=require('../src/booking/controller/initiateBooking')
const {guestCheckout} = require('../src/booking/controller/guestCheckout')

router.post('/api/v1/checkout-session/guest',guestCheckout,createCheckout)

router.post('/api/v1/checkout-session/:userId',createCheckout)

router.get('/api/v1/BookingDetails/:bookingId',BookingDetails)

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