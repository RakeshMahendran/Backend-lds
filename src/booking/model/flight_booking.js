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
    booking_status:{
        type:String,
        enum:["init","PNR","cancled","ticketing","confirmed"]
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
        client_secret:{
            type:String
        },
        chargeId:{
            type:String,
        },
        // checkoutSessionId:{
        //     type:String
        // }
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
        this.base_fare+=f.BaseFare*pass[f.PaxType]
        this.total_tax+=f.Taxes*pass[f.PaxType]
       }
       // this.base_fare=Math.round(this.base_fare)
       // this.total_tax=Math.round(this.total_tax)
       this.gross_fare=this.base_fare+this.total_tax
       this.markup=20
       //this.invoice_fare=this.gross_fare+this.markup
       this.pay_fare=(((this.gross_fare+this.markup)/100)*3).toFixed(2)

       this.invoice_fare=Math.round(this.gross_fare+this.markup+this.pay_fare)
       
    }
}

module.exports=mongoose.model('FlightBooking',flight_bookings)