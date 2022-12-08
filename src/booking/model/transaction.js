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
    card:{
        last4:Number,
        brand:String,
        expMonth:Number,
        expYear:Number
    },
    receiptURI:String,
    amountCharged:Number,
    currency:String,
    countryOfPayment:String,
    status:String

})

module.exports=mongoose.model('Transaction',transactionSchema)
