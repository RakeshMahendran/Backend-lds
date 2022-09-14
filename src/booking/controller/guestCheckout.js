
const {User} = require('../../users/models/userModel')

exports.guestCheckout = (req,res,next)=>{

    User.findOne({email:req.body.PassengerContactInfo.Email}).exec(async (err,data)=>{
        if(err){
            console.log('[+]Error data form guest user');
        }
        else if(!data){
            const user = new User();
            user.email=req.body.PassengerContactInfo.Email
            user.phoneNo= req.body.PassengerContactInfo.PhoneNumber
            user.countryCode=req.body.PassengerContactInfo.PhoneCountryCode

            const guestUser = await user.save();
            req.userId=guestUser._id;
            next()
        }

        else{
            console.log('[+]Already exsting guest user',data)
            req.userId=data._id
            next()
        }
    })

}