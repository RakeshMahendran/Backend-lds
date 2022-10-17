
const mongoose = require("mongoose")

const markup = mongoose.Schema({
    start_dateTime:{
        type:Date,
        default:null
    },
    end_dateTime:{
        type:Date,
        default:null
    },
    valid:{
        type:Boolean,
        default:true
    },
    origin:{
        type:String,
        default:null
    },
    destination:{
        type:String,
        default:null

    },
    api_id:{
        type:String,
        default:null

    },
    airline:{
        type:String,
        default:null

    },
    user_id:{
        type:mongoose.Schema.ObjectId,
        ref:"user",
        default:null

    },
    user_group_id:{
        type:mongoose.Schema.ObjectId,
        default:null

        
    },
    markup_type:{
        type:String,
        enum:["flat","%"],
        default:"%"
    },
    markup_value:{
        type:Number,
        default:null

    },
    comission_type:{
        type:String,
        enum:["flat","%"],
        default:"%"
    },
    comission_value:{
        type:Number,
        default:null

    },
    exclude_origin:{
        type:String,
        default:null

    }
},{timeStamps:true})


module.exports = mongoose.model('MarkUp',markup)