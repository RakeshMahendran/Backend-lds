const mongoose = require('mongoose');


const transactionSchema= new mongoose.Schema({
    payIntentId:{
        type:String,
        required:true
    },
    chargeId:{
        type:String
    },
    clientSecret:{
        type:String
    },
    service:{
        type:String,
        enum:['flights','hotels','activities']
    },
    card:{
        last4:Number,
        brand:String,
        expMonth:Number,
        expYear:Number
    },
    refund:{
        id:String,
        amount:Number,
        reason:String,
        status:{
            type:String,
            enum:["pending","succeeded","failed"]
        }
    },
    receiptURI:String,
    amountCharged:Number,
    currency:String,
    countryOfPayment:String,
    status:{
        type:String,
        default:"unpaid",
        enum:["unpaid","paid","refunded"]
    }

})

module.exports=mongoose.model('Transaction',transactionSchema)
