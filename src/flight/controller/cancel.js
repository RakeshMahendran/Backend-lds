
const fetch = require('node-fetch')

const FlightBooking = require('../model/flight_booking')
const {stripeRefund}= require('../../stripe/stripe.refund')

cancelPNR=async(pnr)=>{
    const reqBody={
        pnr:pnr
    }
    const headers={
        "Content-type":"Application/json"
    }
    console.log('[+]Cancel pnr init...')
   let response=await fetch(`${process.env.CUSTOMERSERVICE}/api/v1/flight/cancel`,{
        method:"POST",
        headers:headers,
        body:JSON.stringify(reqBody)
    })
    
    // response=await response.text();
    // let jsonResponse
    // await parseString(response,(err,result)=>{
    //     jsonResponse=result
    // })

    // return jsonResponse["soap:Envelope"]["soap:Body"][0]["ns2:CancelPNRResponseBody"][0]
    // console.log('[+*]',await response.json())
    return response.json()

}

exports.cancel=async(req,res)=>{
    try{
        const flight = await FlightBooking.findById(req.bookingId)
        if(!flight){
            throw {"message":`No flightBookings found on this Booking id ${req.bookingId}`,bookingId:req.bookingId}
        }

        let t= new Date()
        // checking the 24 hrs time limit
        console.log(`[+]Flight cancel time ${flight.cancelTimeLimit}`)
        t=((flight.cancelTimeLimit-t)/(1000*60)).toFixed(2)
        console.log('[+]Today date',t)
        
        if(t<0){
            throw {
                message:"the 24 hrs time limit for cancelation is completed"
            }
        }

        // const response= await cancelPNR(flight.api_pnr)
        const response={
            error:false,
        }
        if(response.error){
            throw {
                message:response.message
            }
        }

        const stripeRefundData= await stripeRefund({transactionId:flight.transaction})
        
        if(stripeRefundData.error){
            throw{
                message:stripeRefundData.message
            }
        }

        flight.payment_status=stripeRefundData.status.payment
        flight.booking_status=stripeRefundData.status.booking

        await flight.save()
        return res.json({
            error:false,
            message:stripeRefundData.message?stripeRefundData.message:"The ticket is cancelled and the refund is successfull..",
            data:{
                amount:stripeRefundData.amount
            }
        })

        }catch(e){
        console.log('[+]',e);
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