const {UserHotel} = require("../../models/userModelHotel")

exports.storeCustomerInfo = (req,res,next) =>{
    try{

        UserHotel.findOne({email:req.body.PassengerContactInfo.Email}).exec(async (err,data)=>{
            if(err){
                console.log('[+]Error data form guest user');
            }
            else if(!data){
                console.log('[+]Creating new user')
                const user = new UserHotel();
                user.email=req.body.PassengerContactInfo.Email
                user.phoneNo= req.body.PassengerContactInfo.PhoneNumber
                user.countryCode=req.body.PassengerContactInfo.PhoneCountryCode
                user.role=1
                const guestUser = await user.save();
                req.userId=guestUser._id;
                console.log('[+]New user id ',req.userId)
                next()
            }
    
            else{
                console.log('[+]Already exsting guest user',data)
                req.userId=data._id
                next()
            }
        })
    }
    catch (error){
        res.json({
            error:true,
            message: error,
            file: "storeCustomerInfo.js"
        })
    }
}