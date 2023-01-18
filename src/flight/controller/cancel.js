
const fetch = require('node-fetch')
const parseString = require('xml2js').parseString
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const axios=require('axios')

const FlightBooking = require('../model/flight_booking')
const Transaction = require('../model/transaction')
const { json } = require('body-parser')

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
        // console.log('[=]',response)
        // if(response["TPErrorList"]){
        //     throw response["TPErrorList"][0]["TPError"][0]["errorText"][0]
        // }

        // if(response.error){
        //     throw {
        //         message:response.message
        //     }
        // }
        
        const stripeResponse=await axios.post(`${process.env.CORESERVICE}/stripe/refund`,
        {
             id:flight.transaction,
             reason:"Testing purspose"
        })
        // console.log(stripeResponse)
        if(stripeResponse.data)
        {
            if(stripeResponse.data.error==false)
            {
                flight.payment_status=stripeResponse.data.status.payment
                flight.booking_status=stripeResponse.data.status.booking
                await flight.save()
                return res.json({
                    error:false,
                    message:"The ticket is cancelled and the refund is successfull..",
                    data:{
                        amount:stripeResponse.data.amount
                    }
                })
            }
            if(stripeResponse.data.error==true)
            {
                 if(stripeResponse.data.message=="the refund is already done")
                 {
                    flight.payment_status=stripeResponse.data.status.payment
                    flight.booking_status=stripeResponse.data.status.booking
                    await flight.save()
                    res.json(
                        {
                            error:true,
                            amount:stripeResponse.data.amount,
                            message:stripeResponse.data.message
                        }
                    )
                 }
                 else
                 {
                     res.json(
                         {
                             error:true,
                             messgae:stripeResponse.data.message
                         }
                     )
                 }
                 
            }
        }

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