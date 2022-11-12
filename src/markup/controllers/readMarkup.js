const MarkUp = require("../model/markUp")

const {bestMarkUp} = require("./bestMarkUp")

exports.readMarkup =async (req,res)=>{
    MarkUp.find(req.query).exec((err,data)=>{
        if(err||!data){
            console.log('[+]error',err)
            return res.json({
                error:true,
                messaga:err
            })
        }
        bestMarkUp("SFO","ABC","india")
        return res.json({
            error:false,
            data:data
        })
    })
}

