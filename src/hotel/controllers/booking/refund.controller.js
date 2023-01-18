const stripe = require('stripe')("sk_test_51MM4SOSD8Tx3bLSXMx0zHnKLa7RoMMmebjxvPYq4XpQLg41K6YXDAeF049aj7SWJVbSHmqXQqC2QB7Ie1SUxpNqI00NxhTQBuH")

exports.refund = async(req,res)=>{
    const refund = await stripe.refunds.create({
        payment_intent: 'pi_3MM7BxSD8Tx3bLSX0SDQsWn2',
        amount: 500,
      });
    console.log(refund);
}