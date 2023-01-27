const express = require('express');
const router = express.Router();

const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    },
});


//Email the ticket details to the user
router.post("/", async (req, res) => {

    const email = req.body.email;
    const purchase_date = req.body.purchase_date;
    const tripDate = req.body.tripDate;
    const link = req.body.link;
    const type = req.body.type;
    const depart = req.body.depart;
    let returnDate
    if (type !== "ONE-WAY") {
        returnDate = `<div
        style="color:#455056; font-size:15px;line-height:24px; margin:20px 0 0 0;display:flex;align-items:flex-start;padding:0 10px">
        <div
            style="display:flex;align-items:flex-start;padding:0 10px; column-gap: 30px;">
            <span style="text-transform: uppercase;width:150px;text-align: left;">
                <b>
                    Return Date:
                </b>
            </span>
            <span
                style="color:#455056; font-size:15px;line-height:24px; margin:0;text-align: left;width: 350px;">${req.body.return}</span>
        </div>
    </div>`;
    }
    else {
        returnDate = ``;
    }

    const flight = req.body.flight;
    const flight_number = req.body.flight_number;
    const origin = req.body.origin;
    const destination = req.body.destination;
    const confirmation_number = req.body.confirmation_number;
    const total = req.body.total;
    const passenger = req.body.passenger;
    let passenger_count = `<div
    style="color:#455056; font-size:15px;line-height:24px; margin:20px 0 0 0;display:flex;align-items:flex-start;padding:0 10px">
    <div
        style="display:flex;align-items:flex-start;padding:0 10px; column-gap: 30px;">
        <span style="text-transform: uppercase;width:150px;text-align: left;">
            <b>
                Passenger Count:
            </b>
        </span>
        <span
        style="color:#455056; font-size:15px;line-height:24px; margin:0;text-align: left;width: 350px;">
        `;
    if (req.body.passenger_count.adult > 0) {
        passenger_count += `${req.body.passenger_count.adult} Adult(s)<br />`;
    } else { passenger_count += `` }
    if (req.body.passenger_count.child > 1) {
        passenger_count += `${req.body.passenger_count.child} Children<br />`;
    }else if (req.body.passenger_count.child == 1) {
        passenger_count += `${req.body.passenger_count.child} Child<br />`;
    } else { passenger_count += `` }
    if (req.body.passenger_count.infant > 0) {
        passenger_count += `${req.body.passenger_count.infant} Infant(s)`;
    } else { passenger_count += `` }
    passenger_count += `</span>
                    </div>
                </div>`;
    let seat_number = ""
    for (let i = 0; i < req.body.seat_info.length; i++) {

        if (i == req.body.seat_info.length - 1) {
            seat_number += req.body.seat_info[i]

        } else {
            seat_number += req.body.seat_info[i] + ", ";
        }

    }
    let seat_info = "";
    if (req.body.seat_info.length != 0) {
        seat_info = `<div
                        style="color:#455056; font-size:15px;line-height:24px; margin:20px 0 0 0;display:flex;align-items:flex-start;padding:0 10px">
                        <div
                            style="display:flex;align-items:flex-start;padding:0 10px; column-gap: 30px;">
                            <span style="text-transform: uppercase;width:150px;text-align: left;">
                                <b>
                                    Seat Information:
                                </b>
                            </span>
                            <span
                                style="color:#455056; font-size:15px;line-height:24px; margin:0;text-align: left;width: 350px;">${seat_number}</span>
                        </div>
                    </div>`
    }
    const book_again = req.body.book_again


    //mail options
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: `Your trip to ${destination} on ${tripDate}`,
        html: `

         <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
             <!--100% body table-->
             <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
                 style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
                 <tr>
                     <td>
                         <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                             align="center" cellpadding="0" cellspacing="0">
                             <tr>
                                 <td style="height:80px;">&nbsp;</td>
                             </tr>
                             <tr>
                                 <td style="height:20px;">&nbsp;</td>
                             </tr>
                             <tr>
                                 <td>
                                     <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                         style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                         <tr>
                                             <td style="height:40px;">&nbsp;</td>
                                         </tr>
                                         <tr>
                                             <td style="padding:0 35px;">
                                                 <h1
                                                     style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">
                                                     Congrats, your trip on ${tripDate} is confirmed!</h1>
                                                 <span
                                                     style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                                 <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                                     <b>The summary of your trip has been given below</b>
                                                 </p>
                                                 <div
                                                     style="color:#455056; font-size:15px;line-height:24px; margin:20px 0 0 0;display:flex;align-items:flex-start;padding:0 10px">
                                                     <div
                                                         style="display:flex;align-items:flex-start;padding:0 10px; column-gap: 30px;">
                                                         <span style="text-transform: uppercase;width:150px;text-align: left;">
                                                             <b>
                                                                 purchased on:
                                                             </b>
                                                         </span>
                                                         <span
                                                             style="color:#455056; font-size:15px;line-height:24px; margin:0;text-align: left;width: 350px;">${purchase_date}</span>
                                                     </div>
                                                 </div>
                                                 <div
                                                     style="color:#455056; font-size:15px;line-height:24px; margin:20px 0 0 0;display:flex;align-items:flex-start;padding:0 10px">
                                                     <div
                                                         style="display:flex;align-items:flex-start;padding:0 10px; column-gap: 30px;">
                                                         <span style="text-transform: uppercase;width:150px;text-align: left;">
                                                             <b>
                                                                 Trip Scheduled On:
                                                             </b>
                                                         </span>
                                                         <span
                                                             style="color:#455056; font-size:15px;line-height:24px; margin:0;text-align: left;width: 350px;">${tripDate}</span>
                                                     </div>
                                                 </div>
         
                                                 <div
                                                     style="color:#455056; font-size:15px;line-height:24px; margin:20px 0 0 0;display:flex;align-items:flex-start;padding:0 10px">
                                                     <div
                                                         style="display:flex;align-items:flex-start;padding:0 10px; column-gap: 30px;">
                                                         <span style="text-transform: uppercase;width:150px;text-align: left;">
                                                             <b>
                                                                 Departure Date:
                                                             </b>
                                                         </span>
                                                         <span
                                                             style="color:#455056; font-size:15px;line-height:24px; margin:0;text-align: left;width: 350px;">${depart}</span>
                                                     </div>
                                                 </div>
                                                 ${returnDate}
                                                
                                                 <div
                                                     style="color:#455056; font-size:15px;line-height:24px; margin:20px 0 0 0;display:flex;align-items:flex-start;padding:0 10px">
                                                     <div
                                                         style="display:flex;align-items:flex-start;padding:0 10px; column-gap: 30px;">
                                                         <span style="text-transform: uppercase;width:150px;text-align: left;">
                                                             <b>
                                                                 Flight Name:
                                                             </b>
                                                         </span>
                                                         <span
                                                             style="color:#455056; font-size:15px;line-height:24px; margin:0;text-align: left;width: 350px;">${flight}</span>
                                                     </div>
                                                 </div>
                                                 <div
                                                     style="color:#455056; font-size:15px;line-height:24px; margin:20px 0 0 0;display:flex;align-items:flex-start;padding:0 10px">
                                                     <div
                                                         style="display:flex;align-items:flex-start;padding:0 10px; column-gap: 30px;">
                                                         <span style="text-transform: uppercase;width:150px;text-align: left;">
                                                             <b>
                                                                 Flight Number:
                                                             </b>
                                                         </span>
                                                         <span
                                                             style="color:#455056; font-size:15px;line-height:24px; margin:0;text-align: left;width: 350px;">${flight_number}</span>
                                                     </div>
                                                 </div>
                                                 <div
                                                     style="color:#455056; font-size:15px;line-height:24px; margin:20px 0 0 0;display:flex;align-items:flex-start;padding:0 10px">
                                                     <div
                                                         style="display:flex;align-items:flex-start;padding:0 10px; column-gap: 30px;">
                                                         <span style="text-transform: uppercase;width:150px;text-align: left;">
                                                             <b>
                                                                 Origin:
                                                             </b>
                                                         </span>
                                                         <span
                                                             style="color:#455056; font-size:15px;line-height:24px; margin:0;text-align: left;width: 350px;">${origin}</span>
                                                     </div>
                                                 </div>
                                                 <div
                                                     style="color:#455056; font-size:15px;line-height:24px; margin:20px 0 0 0;display:flex;align-items:flex-start;padding:0 10px">
                                                     <div
                                                         style="display:flex;align-items:flex-start;padding:0 10px; column-gap: 30px;">
                                                         <span style="text-transform: uppercase;width:150px;text-align: left;">
                                                             <b>
                                                                 Destination:
                                                             </b>
                                                         </span>
                                                         <span
                                                             style="color:#455056; font-size:15px;line-height:24px; margin:0;text-align: left;width: 350px;">${destination}</span>
                                                     </div>
                                                 </div>
                                                 <div
                                                     style="color:#455056; font-size:15px;line-height:24px; margin:20px 0 0 0;display:flex;align-items:flex-start;padding:0 10px">
                                                     <div
                                                         style="display:flex;align-items:flex-start;padding:0 10px; column-gap: 30px;">
                                                         <span style="text-transform: uppercase;width:150px;text-align: left;">
                                                             <b>
                                                                 Confirmation Number:
                                                             </b>
                                                         </span>
                                                         <span
                                                             style="color:#455056; font-size:15px;line-height:24px; margin:0;text-align: left;width: 350px;">${confirmation_number}
                                                         </span>
                                                     </div>
                                                 </div>
                                                 <div
                                                     style="color:#455056; font-size:15px;line-height:24px; margin:20px 0 0 0;display:flex;align-items:flex-start;padding:0 10px">
                                                     <div
                                                         style="display:flex;align-items:flex-start;padding:0 10px; column-gap: 30px;">
                                                         <span style="text-transform: uppercase;width:150px;text-align: left;">
                                                             <b>
                                                                 Total Cost:
                                                             </b>
                                                         </span>
                                                         <span
                                                             style="color:#455056; font-size:15px;line-height:24px; margin:0;text-align: left;width: 350px;">${total}
                                                         </span>
                                                     </div>
                                                 </div>
                                                 <div
                                                     style="color:#455056; font-size:15px;line-height:24px; margin:20px 0 0 0;display:flex;align-items:flex-start;padding:0 10px">
                                                     <div
                                                         style="display:flex;align-items:flex-start;padding:0 10px; column-gap: 30px;">
                                                         <span style="text-transform: uppercase;width:150px;text-align: left;">
                                                             <b>
                                                                 Passenger Name:
                                                             </b>
                                                         </span>
                                                         <span
                                                             style="color:#455056; font-size:15px;line-height:24px; margin:0;text-align: left;width: 350px;">${passenger}
                                                         </span>
                                                     </div>
                                                 </div>
                                                 ${passenger_count}
                                                 ${seat_info}
                                                 <div style="display:flex;align-items:center;justify-content:center; column-gap:10px;padding:0 10px">
                                                    <a href=${link}
                                                     style="background:#E1A658;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">
                                                        View in Website
                                                     </a>

                                                     <a href=${book_again}
                                                    style="background:#E1A658;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Book
                                                    Again</a>
                                                 </div> 
                                             </td>
                                         </tr>
                                         <tr>
                                             <td style="height:40px;">&nbsp;</td>
                                         </tr>
                                     </table>
                                 </td>
                             <tr>
                                 <td style="height:20px;">&nbsp;</td>
                             </tr>
                             <tr>
                                 <td style="text-align:center;">
                                     <p
                                         style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">
                                         &copy; <strong>www.travelfika.com</strong></p>
                                 </td>
                             </tr>
                             <tr>
                                 <td style="height:80px;">&nbsp;</td>
                             </tr>
                         </table>
                     </td>
                 </tr>
             </table>
             <!--/100% body table-->
         </body>`,
    }

    await transporter
        .sendMail(mailOptions)
        .then(() => {
            res.json({
                status: 'Sent',
                message: "Ticket email sent",
            })
        }).catch(error => {
            console.log(error)
            res.json({
                status: "FAILED",
                message: "Email sending failed",
            })
        })
})

module.exports = router 