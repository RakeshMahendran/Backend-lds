
const {User} = require('../../users/models/userModel')

exports.guestCheckout = (req,res,next)=>{
      try
      {
            User.findOne({email:req.body.PassengerContactInfo.Email}).exec(async (err,data)=>{
                if(err){
                    console.log('[+]Error data form guest user');
                }
                else if(!data){
                    console.log('[+]Creating new user')
                    try
                    {
                        const user = new User();
                        user.email=req.body.PassengerContactInfo.Email
                        user.phoneNo= req.body.PassengerContactInfo.PhoneNumber
                        user.countryCode=req.body.PassengerContactInfo.PhoneCountryCode
                        user.role=1
                        const guestUser = await user.save();
                        req.userId=guestUser._id;
                        console.log('[+]New user id ',req.userId)
                        next()
                    }
                    catch(e)
                    {
                        console.log(e)
                        res.json(
                            {
                                error:true,
                                response:'Error while creating a new user in guest Checkout',
                                message:e.message
                            }
                        )
                    }
                }
        
                else{
                    console.log('[+]Already exsting guest user',data)
                    req.userId=data._id
                    next()
                }
            })
      }
      catch(e)
      {
            res.json(
                {
                    error:true,
                    response:"Error in Guest Checkout",
                    message:e.message
                }
            )
      }

}