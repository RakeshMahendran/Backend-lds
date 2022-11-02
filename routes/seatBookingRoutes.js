const express = require('express');
const router = express.Router();

const { seatMap } = require('../src/seat-map/seatBooking')

router.post('/api/v1/flight/seatAvailSearch', seatMap)

module.exports=router;
