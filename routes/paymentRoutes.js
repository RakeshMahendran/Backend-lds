const express = require('express');
const router = express.Router();




const {generatePNR, getPrice,stripeCheckout,guestCheckout}=require('../src/booking/controller/booking')


const {requiredSignin} = require('../src/users/middleware/requiredSignin')



router.post('/api/v1/flight/reprice/:itineraryId',getPrice)

router.post('/api/v1/flight/initPayBook/guest',guestCheckout,generatePNR,stripeCheckout)

router.post('/api/v1/flight/initPayBook/:userId',requiredSignin,generatePNR,stripeCheckout)

// router.post('/api/v1/flight/issueTicket')

// router.get('/api/v1/flight/cancelBooking')

router.param('itineraryId',(req,res,next,id)=>{
    req.itineraryId=id;
    next();
})

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