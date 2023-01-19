const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const connectDB = require("./dbConnect");
const dotenv = require('dotenv');

const {payintent} = require("./booking/controller/successPayment")
const {checkWebhookSignature}= require("./stripe/webhookCheck")
const {webhookManager} = require("./stripe/webhookManager")

// d75d76c0419c7ddd5c8f674a626d6b63328c3e82
// d75d76c0419c7ddd5c8f674a626d6b63328c3e82
//Load Config
dotenv.config();
connectDB();

const passport = require("passport");
//const authRoute = require("./routes/auth ");
const googleAuth = require("./users/controllers/googleAuth")
const emailTicket = require("./users/controllers/ticketEmail")
const cookieSession = require("cookie-session");
const session = require('express-session');
const passportSetup = require("./users/utils/passportSetup");

app.post('/stripe/session', express.raw({type: 'application/json'}),checkWebhookSignature,webhookManager )

app.use(express.json());
// adding Helmet to enhance your Rest API's security
app.use(helmet());
// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());
// enabling CORS for all requests
app.use(
  cors({
  origin: [process.env.WEB_FRONTEND_URL_1, process.env.WEB_FRONTEND_URL_2],
  methods: "GET,POST,PUT,DELETE",
  credentials: true,
  })
  );



// adding morgan to log HTTP requests
app.use(morgan('combined'));

app.use(
  cookieSession({
    name: "session",
    keys: ["rakesh"],
    maxAge: 24 * 60 * 60 * 100,
  })
);

app.use(passport.initialize());
app.use(passport.session());


//import routes
const userRoute = require('../routes/userRoute');
const paymentRoutes = require('../routes/paymentRoutes')
const markup = require('../routes/markupRoutes') 
const seatBookingRoute = require('../routes/seatBookingRoutes')
// const googleAuthRoute = require('../routes/googleAuthRoute')


//middlewares
app.use("/", userRoute);
app.use("/", paymentRoutes)
app.use("/api/v1/markup", markup)
app.use("/", seatBookingRoute)
app.use("/", googleAuth)
app.use("/mailTicket", emailTicket)

const PORT = process.env.PORT || 6030;
app.listen(PORT, () => {
  console.log("server is listening at port http://localhost:6030");
});



