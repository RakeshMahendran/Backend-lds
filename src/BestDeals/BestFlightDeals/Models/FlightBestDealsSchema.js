const mongoose = require('mongoose')

const FlightBestDealsSchema= mongoose.Schema({
    title:{
        type:String
    },
    thumbnail:{
        type:String
    },
    description:{
        type:String
    },
    gallery:[
        {
            type:String
        }
    ],
    flightData:{
            From:{
                type:String
            },
            To:{
                type:String
            },
            price:{
                type:Number
            },
            currency:{
                type:String
            }
        }
    
})

module.exports = mongoose.model('BestFlightDeal',FlightBestDealsSchema)