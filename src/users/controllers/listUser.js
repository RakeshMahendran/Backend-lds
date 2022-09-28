const {User} = require('../models/userModel')

exports.listUser=(req,res)=>{
    User.find({}).exec((err,users)=>{
        return res.json({
            error:false,
            users:users
        })
    })
}