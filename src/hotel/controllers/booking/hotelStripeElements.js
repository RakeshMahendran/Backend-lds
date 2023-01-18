const stripe = require('stripe')("sk_test_51MM4SOSD8Tx3bLSXMx0zHnKLa7RoMMmebjxvPYq4XpQLg41K6YXDAeF049aj7SWJVbSHmqXQqC2QB7Ie1SUxpNqI00NxhTQBuH")

exports.hotelStripeElements=async(req,res)=>{

    const customer = await stripe.customers.create({
        id:req.userId,
        email:req.body.PassengerContactInfo.Email,
    })
    const payment_intent = await stripe.paymentIntents.create({
        amount:"1000",
        currency:"inr",
        customer: customer.id
        // metadata:{
        //     "bookingId":String(data._id),
        //     "invoice":String(newTransaction._id)
        // }
    })

    console.log("id:",payment_intent.id,"\nclient_secret:",payment_intent.client_secret);
    return res.json({
        error:false,
        payment_intent:payment_intent.client_secret
    })

}
