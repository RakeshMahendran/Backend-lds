const express = require('express');
const router = express.Router();




const {generatePNR}=require('../src/booking/controller/generatePNR');
const {stripeCheckout} = require('../src/booking/controller/stripeCheckout')
const {guestCheckout} = require('../src/booking/controller/guestCheckout')
const {getPrice,repriceAndAddJourney}= require('../src/booking/controller/reprice')
const { BookingDetails } = require('../src/booking/controller/bookingDetails');
const {listFlight} = require('../src/booking/controller/listFlight')
const {cancel}= require('../src/booking/controller/cancel')
const {createPassengers} = require('../src/booking/controller/createPassengers')
const {successPayment}= require('../src/booking/controller/successPayment')

const {requiredSignin} = require('../src/users/middleware/requiredSignin')



router.post('/api/v1/flight/reprice/:itineraryId',getPrice)

router.post('/api/v1/flight/initPayBook/guest',guestCheckout,createPassengers,repriceAndAddJourney,generatePNR,stripeCheckout)

router.post('/api/v1/flight/initPayBook/:userId',requiredSignin,createPassengers,repriceAndAddJourney,generatePNR,stripeCheckout)

router.get('/api/v1/flight/cancel/:bookingId',cancel)

router.get('/api/v1/flight/bookingDetails/:bookingId',BookingDetails)

router.get('/api/v1/flight/list/:userId',listFlight)

router.get('/api/v1/flight/paymentSuccess/:bookingId',successPayment)



// router.post('/api/v1/flight/issueTicket')

// router.get('/api/v1/flight/cancelBooking')

router.param('pnr',(req,res,next,id)=>{
    req.pnr=id;
    next();
})

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