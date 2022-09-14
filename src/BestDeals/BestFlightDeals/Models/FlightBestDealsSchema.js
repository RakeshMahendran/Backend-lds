const { required } = require('joi')
const mongoose = require('mongoose')

const FlightBestDealsSchema= mongoose.Schema({
    urlName:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
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