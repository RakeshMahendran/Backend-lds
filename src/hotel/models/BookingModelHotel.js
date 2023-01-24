const mongoose = require('mongoose')

const taxes_schema = mongoose.Schema({
    
        included: {
          type: Boolean
        },
        amount: {
          type: String
        },
        currency: {
          type: String
        },
        clientAmount: {
          type: String
        },
        clientCurrency: {
          type: String
        }
      
})

const cancellationPolicies_schema = mongoose.Schema({
    
        amount: {
          type: String
        },
        from: {
          type: Date
        }
      
})

const rates_schema = mongoose.Schema({
    
        rateKey: {
          type: String
        },
        rateClass: {
          type: String
        },
        rateType: {
          type: String
        },
        net: {
          type: String
        },
        allotment: {
          type: Number
        },
        rateCommentsId: {
          type: String
        },
        paymentType: {
          type: String
        },
        packaging: {
          type: Boolean
        },
        boardCode: {
          type: String
        },
        boardName: {
          type: String
        },
        cancellationPolicies: {
          type: [
            cancellationPolicies_schema
          ]
        },
        taxes: {
          taxes: {
            type: [
              taxes_schema
            ]
          },
          allIncluded: {
            type: Boolean
          }
        },
        rooms: { // denotes total number of rooms
          type: Number
        },
        adults: {
          type: Number
        },
        children: {
          type: Number
        },
        // promotions: {
        //   type: [
        //     Mixed
        //   ]
        // }
      
}) 

const paxes_schema = mongoose.Schema({
  roomId : {
    type: String
  },
  type:{
    type:String
  },
  age:{
    type:String || Number
  },
  name:{
    type: String
  },
  surname: {
    type: String
  }
})

const rooms_schema = mongoose.Schema({
    
        code: {
          type: String
        },
        name: {
          type: String
        },
        rates: {
          type: rates_schema
  
        }
      
})

const  hotel_bookings = mongoose.Schema({
        userId : {
          type:mongoose.Schema.ObjectId,
          ref:'UserHotel'
        },
        cancellationReference:{
          type: String
        },
        code: {
          type: Number
        },
        booking_status:{
          type:String,
          enum:["init","canceled","confirmed","failed"]
        },
        booking_reference:{
          type: String
        },
        clientReference:{
          type: String
        },
        payment_method:{
          type:String,
          enum : ["AT_HOTEL","AT_WEB"]
        },
        payment_status:{
          type:String,
          default:"unpaid",
          enum:["unpaid","paid","partially paid","refunded","refund initiated"]
          //unpaid,fullpair, partially paid
        },
        transaction:{
          type:mongoose.Schema.ObjectId,
          ref:'Transaction'
        },
        name: {
          firstName: {
            type: String,
          },
          lastName: {
            type: String,
          }
        },
        categoryCode: {
          type: Number
        },
        categoryName: {
          type: String
        },
        destinationCode: {
          type: String
        },
        destinationName: {
          type: String
        },
        zoneCode: {
          type: Number
        },
        zoneName: {
          type: String
        },
        latitude: {
          type: String
        },
        longitude: {
          type: String
        },
        rooms: {
          type: [
            rooms_schema
          ]
        },
        paxes:{
          type:[
            paxes_schema
          ]
        },
        minRate: {
          type: String
        },
        maxRate: {
          type: String
        },
        currency: {
          type: String
        },
        checkInDate: {
            type: Date
        },
        checkOutDate: {
            type : Date
        },
      
},{timestamps:true})

module.exports=mongoose.model('HotelBooking',hotel_bookings)