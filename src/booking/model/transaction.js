const mongoose = require('mongoose');


const paymentGatewaySchema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    }
})



const transactionSchema= new mongoose.Schema({
    paymentgateway
    invoice
    transactionid
    

})

const Transaction=mongoose.model('Transaction',transactionSchema)
const PaymentGateway=mongoose.model('PaymentGateway',paymentGatewaySchema)
module.exports={Transaction,PaymentGateway}