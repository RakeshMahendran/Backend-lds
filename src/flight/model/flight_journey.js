const mongoose = require('mongoose')


const journey = new mongoose.Schema({
    journey_segments:[
        {
            type:mongoose.Schema.ObjectId,
            ref:"FlightSegment"
        }
    ]
})

const Journey = mongoose.model('Journey',journey);

module.exports=Journey;