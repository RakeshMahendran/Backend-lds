const {User} = require('../models/userModel')

const JWT= require('jsonwebtoken')

exports.requiredSignin=(req,res,next)=>{
    
    if(!req.headers.authorization){
        return res.status(400).json({code:0,msg:"User not singed in 1"});  
    }
    const token=req.headers.authorization.split(" ")[1];
    User.findById(req.userId,(err,user)=>{
        if(err||!user){
            console.log("[+]user signedin ",req.userId)
            return res.status(400).json({error:false,msg:"User not registered"});
        }
        console.log('[+]User',user)
        JWT.verify(token,process.env.SECRET_KEY,(err,data)=>{
            if(err||!data){
                return res.status(400).json({error:false,msg:"User not singed in 2"});
            }
            if(String(user._id)!==data.id){
                console.log('[+]User not authenticated');
                return res.status(400).json({error:false,msg:"User not singed in 3"});
            }

            next()
    })
    })
    
   
}