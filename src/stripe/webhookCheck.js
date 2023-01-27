const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

exports.checkWebhookSignature=(req,res,next)=>{
    console.log('[+]Stripe webhook signature check init...')

    const signature=req.headers['stripe-signature']
    const endpointSecret=process.env.STRIPE_WEBHOOK_KEY
    // const endpointSecret='whsec_63d6696d8e652a61500a19d9a576f847cf02655d2d242f5eb6ca9c2596914844'

    try{
        let data=stripe.webhooks.constructEvent(req.body,signature,endpointSecret)
        // req.body.type=type;
        console.log('[+]Stripe webhook signature check success...')
        req.body=data
        next()
    }catch(e){
        // console.log('[+]Error in received webhook ',e)
        console.log('[+]Stripe webhook signature check finished with error...')
        res.status(500)
        res.send("not a valid request")
    }


}