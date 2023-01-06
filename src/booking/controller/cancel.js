
const fetch = require('node-fetch')
const parseString = require('xml2js').parseString
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)


const FlightBooking = require('../model/flight_booking')
const Transaction = require('../model/transaction')

cancelPNR=async(pnr)=>{
    reqBody='<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v2="http://trippro.com/webservices/cancelpnr/v2" xmlns:v21="http://trippro.com/webservices/common/v2">'
    reqBody+='<soapenv:Header />'
    reqBody+=`<soapenv:Body>
    <v2:CancelPNRRequestBody>
        <v21:TPContext>
            <v21:messageId>Cancel_PNR</v21:messageId>
            <v21:clientId>${process.env.clientId}</v21:clientId>
        </v21:TPContext>
        <v2:CancelPNRRequest>
            <v2:RecordLocator>${pnr}</v2:RecordLocator>
        </v2:CancelPNRRequest>
    </v2:CancelPNRRequestBody>
</soapenv:Body>`

const headers={
    "Content-Type":"application/xml",
}
console.log('[+]Cancel pnr init...')
   let response=await fetch(`http://api.trippro.com/api/v2/cancelPnr?clientid=${process.env.clientId}`,{
        method:"POST",
        headers:headers,
        body:reqBody
    })
    
    response=await response.text();
    let jsonResponse
    await parseString(response,(err,result)=>{
        jsonResponse=result
    })

    return jsonResponse["soap:Envelope"]["soap:Body"][0]["ns2:CancelPNRResponseBody"][0]

}

exports.cancel=async(req,res)=>{
    try{
        const flight = await FlightBooking.findById(req.bookingId)
        if(!flight){
            throw {"message":`No flightBookings found on this Booking id ${req.bookingId}`,bookingId:req.bookingId}
        }

        let t= new Date()
        //checking the 24 hrs time limit
        console.log('[+]Today date',((flight.cancelTimeLimit-t)/(1000*60)).toFixed(2))
        t=((flight.cancelTimeLimit-t)/(1000*60)).toFixed(2)
        if(t<0){
            throw {
                message:"the 24 hrs time limit for cancelation is completed"
            }
        }

        const response= await cancelPNR(flight.api_pnr)

        if(response["TPErrorList"]){
            throw response["TPErrorList"][0]["TPError"][0]["errorText"][0]
        }
        
        const transaction= await Transaction.findById(flight.transaction)
        if(!transaction){
            throw {message:`No transaction is found for the flightBooking BookingID`,bookingId:req.bookingId,"transaction":flight.transaction}
        }
        if(transaction.refund.status==="succeeded"){
            throw "The refund is already done"
        }
        if(transaction.status==="unpaid")
        {
            throw "The payment is not done completley"
        }
        try{
            const refund = await stripe.refunds.create({
                payment_intent:transaction.payIntentId
            })

            transaction.refund.id=refund.id
            transaction.refund.amount=refund.amount
            transaction.refund.reason=req.body.reason
            transaction.refund.status=refund.status
            transaction.status="refunded"
            flight.payment_status="refunded"
            flight.booking_status="cancled"
            console.log('[+]Refund object ',refund)
            await flight.save()
            await transaction.save()
            return res.json({
                error:false,
                message:"The ticket is cancelled and the refund is successfull..",
                data:{
                    amount:refund.amount
                }
            })

        }catch(e){
            console.log('[+]Error from creating refund ',e.raw)
            if(e.raw.code==="charge_already_refunded"){
                const charge = await stripe.charges.retrieve(transaction.chargeId)
                console.log('[+]Refunded charge ',charge.refunds)
                let refund=charge.refunds[0]
                transaction.refund.id=refund.id
                transaction.refund.amount=refund.amount
                transaction.refund.reason=req.body.reason
                transaction.refund.status=refund.status
                // transaction.status="refunded"
                flight.payment_status="refunded"
                flight.booking_status="cancled" 

                await flight.save()
                await transaction.save()
                throw "the refund is already done"
            }
            throw e.raw.message
        }

        }catch(e){
        console.log('[+]'.e);
        return res.json({
            error:true,
            message:e
        })
    }
}

/*

booked pnr
    paid
        booked
            cancel the ticket
            calc the refund amount
            inti refund
        unbooked
            cancel pnr
            init refund
    unpaid
        notify the user
        cancel the pnr

*/
