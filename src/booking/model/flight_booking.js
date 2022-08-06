const e = require('express')
const mongoose = require('mongoose')

const flight_bookings = mongoose.Schema({
    user_id:{
        type:mongoose.Schema.ObjectId,
        ref:'userSchema',
        require:true
    },
   
    target_api:{
        type:String,
        require:true,

    },
    trip_type:{
        type:String,
        enum:['One-way-trip','Round-way-trip']
    },
    api_pnr:{
        type:String,
        require:true,

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
    booking:{
        booking_id:{
            type:String
        },
        booking_status:{
            type:String,
            enum:[]
        }
    },
    payment_status:{
        type:String,
        default:"unpaid",
        enum:["unpaid","paid","partially paid"]
        //unpaid,fullpair, partially paid
    },
    currency:{
        type:String,
        require:true
    },
    stripe_data:{
        pay_intentId:{
            type:String,
        },
        chargeId:{
            type:String,
        },
        checkoutSessionId:{
            type:String
        }
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
    flight_segments:[
        {
            type:mongoose.Schema.ObjectId,
            ref:'FlightSegment'
        }
    ]

},{timestamps:true})



flight_bookings.methods={
    setFare:function(flightBillData){
        this.base_fare=this.total_tax=this.gross_fare=this.invoice_fare=0
        for(let e of flightBillData){
            this.base_fare+=e.amount.BaseFare;
            this.total_tax+=e.amount.Taxes;
            // this.gross_fare+=e.count*e.unit_amount.GrossFare,
            // this.invoice_fare+=e.count*e.unit_amount.InvoiceFare
        }
    }
}

module.exports=mongoose.model('FlightBooking',flight_bookings)