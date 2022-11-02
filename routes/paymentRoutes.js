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
const {createNewBooking} = require('../src/booking/controller/createNewBooking')
const {requiredSignin} = require('../src/users/middleware/requiredSignin')
const {readTicket}= require('../src/booking/controller/readTicket')

const {seat} = require('../src/booking/controller/seat')
const {stripeElements} = require('../src/booking/controller/stripeElements')

router.post('/api/v1/flight/reprice/:itineraryId',getPrice)

router.post('/api/v1/flight/initPayBook/guest',readQuery,guestCheckout,createNewBooking,createPassengers,repriceAndAddJourney,generatePNR,stripeElements)

router.post('/api/v1/flight/initPayBook/:userId',readQuery,requiredSignin,createNewBooking,createPassengers,repriceAndAddJourney,generatePNR,stripeCheckout)

router.get('/api/v1/flight/cancel/:bookingId',cancel)

router.get('/api/v1/flight/bookingDetails/:bookingId',BookingDetails,readTicket)

router.get('/api/v1/flight/stripeCheckout/:bookingId',stripeCheckout)

router.get('/api/v1/flight/stripeElements/:bookingId',stripeElements)

router.get('/api/v1/flight/list',listFlight)

router.get('/api/v1/flight/paymentSuccess/:bookingId',successPayment)


router.post('/stripe/session',(req,res)=>{
    console.log('[+]Stripe webhook event activated ')
    console.log(req.body)
})


// router.post('/api/v1/flight/issueTicket')

// router.get('/api/v1/flight/cancelBooking')

router.param('pnr',(req,res,next,id)=>{
    req.pnr=id;
    next();
})

router.param('paymentStatus',(req,res,next,id)=>{
    req.paymentStatus=id;
    next();
})

router.param('bookingStatus',(req,res,next,id)=>{
    req.bookingStatus=id;
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

function readQuery(req,res,next){
    const q = req.query
    if(q.bookingId!==undefined){
        req.bookingId=q.bookingId
    }
    // console.log('[+]Querys ',req.query)
    next()
}

module.exports=router;