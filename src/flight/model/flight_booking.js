const e = require('express')
const mongoose = require('mongoose')

const flight_bookings = mongoose.Schema({
    user_id:{
        type:mongoose.Schema.ObjectId,
        ref:'user',
        require:true
    },
    target_api:{
        type:String,
        require:true,
    },
    trip_type:{
        type:String,
        enum:['One-way-trip','Round-way-trip','Multi-city-trip']
    },
    api_pnr:{
        type:String,
        require:true,
    },
    api_refNum:{
        type:Number
    },
    
    airline:{
        type:String,
        require:true,
    },
    flight_passenger_id:[{
        type:mongoose.Schema.ObjectId,
        ref:'FlightPassengers',
        require:true,
    }],
    base_fare:{
        type:Number
    },
    total_tax:{
        type:Number
    },
    gross_fare:{
        type:Number
    },
    commission:{
        type:Number
    },
    markup:{
        type:Number
    },
    ait:{
        type:Number,
    },
    invoice_fare:{
        type:Number
    },
    pay_fare:{
       type:Number
    },
    seat_charge_total_fare:Number,
    seat_assignment_total_fare:Number,
    booking_status:{
        type:String,
        enum:["init","PNR","cancled","ticketing","confirmed"]
    },
    payment_status:{
        type:String,
        default:"unpaid",
        enum:["unpaid","paid","refunded"]
        //unpaid,fullpair, partially paid
    },
    currency:{
        type:String,
        require:true
    },
    cancelTimeLimit:{
        type:Date
    },
    passenger_contact_info:{
        phone_number:{
            type:Number,
        },
        phone_country_code:{
            type:Number,
        },
        alternate_phone_number:{
            type:Number,
        },
        email:{
            type:String,
        }
    },
    flight_journey:[
        
        {
            type:mongoose.Schema.ObjectId,
            ref:'Journey'
        }
    ],
    transaction:{
        type:mongoose.Schema.ObjectId,
        ref:'Transaction'
    }
},{timestamps:true})



flight_bookings.methods={
    setFare:function(fares,pass){
        console.log('[+]fares',fares)
        this.base_fare=this.total_tax=this.gross_fare=this.invoice_fare=0
       for(f of fares){
        this.base_fare+=f.BaseFare*pass[f.PassengerType]
        this.total_tax+=f.TotalTax*pass[f.PassengerType]
       }
       // this.base_fare=Math.round(this.base_fare)
       // this.total_tax=Math.round(this.total_tax)
       this.gross_fare=this.base_fare+this.total_tax
       this.markup=20
       //this.invoice_fare=this.gross_fare+this.markup
       this.pay_fare=(((this.gross_fare+this.markup)/100)*3).toFixed(2)
<<<<<<< HEAD:src/booking/model/flight_booking.js

       this.invoice_fare=Math.round(this.gross_fare+this.markup+this.pay_fare)
=======
       this.invoice_fare=(this.gross_fare+this.markup+this.pay_fare).toFixed(2)
>>>>>>> 7ce52be79d1f546693ab1a4938279b8562118664:src/flight/model/flight_booking.js
       
    }
}

module.exports=mongoose.model('FlightBooking',flight_bookings)