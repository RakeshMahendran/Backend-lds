const express = require('express');
const router = express.Router();

const {generatePNR}=require('../src/flight/controller/generatePNR');
const {stripeCheckout} = require('../src/flight/controller/stripeCheckout')
const {guestCheckout} = require('../src/flight/controller/guestCheckout')
const {getPrice,repriceAndAddJourney}= require('../src/flight/controller/reprice')
const { BookingDetails } = require('../src/flight/controller/bookingDetails');
const {listFlight} = require('../src/flight/controller/listFlight')
const {cancel}= require('../src/flight/controller/cancel')
const {createPassengers} = require('../src/flight/controller/createPassengers')
const {successPayment}= require('../src/flight/controller/successPayment')
const {createNewBooking} = require('../src/flight/controller/createNewBooking')
const {requiredSignin} = require('../src/users/middleware/requiredSignin')
const {readTicket}= require('../src/flight/controller/readTicket')

//CENTRALIZED STRIPE
const {stripeCreate}=require('../src/stripe/stripe.create')
const {stripeRefund}=require('../src/stripe/stripe.refund')



const {stripeElements} = require('../src/flight/controller/stripeElements');


router.post('/api/v1/flight/reprice/:itineraryId',getPrice)

router.post('/api/v1/flight/initPayBook/guest',readQuery,guestCheckout,createNewBooking,createPassengers,repriceAndAddJourney,generatePNR,stripeElements)

router.post('/api/v1/flight/initPayBook/:userId',readQuery,requiredSignin,createNewBooking,createPassengers,repriceAndAddJourney,generatePNR,stripeElements)

router.get('/api/v1/flight/cancel/:bookingId',cancel)

router.get('/api/v1/flight/bookingDetails/:bookingId',BookingDetails,readTicket)

router.get('/api/v1/flight/stripeCheckout/:bookingId',stripeCheckout)

router.get('/api/v1/flight/stripeElements/:bookingId',stripeElements)

router.get('/api/v1/flight/list',listFlight)

router.get('/api/v1/flight/paymentSuccess/:bookingId',successPayment)


//CENTRALIZED STRIPE
router.post('/stripe/create',stripeCreate)

router.post('/stripe/refund',stripeRefund)

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
    console.log("hello",req.body)
    const q = req.query
    if(q.bookingId!==undefined){
        req.bookingId=q.bookingId
    }
    // console.log('[+]Querys ',req.query)
    next()
}

module.exports=router;