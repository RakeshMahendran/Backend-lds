const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const connectDB = require("./dbConnect");
const dotenv = require('dotenv');


dotenv.config();
connectDB();

const passport = require("passport");
//const authRoute = require("./routes/auth ");]/ticketEmail")
const cookieSession = require("cookie-session");


app.use(express.json());
// adding Helmet to enhance your Rest API's security
app.use(helmet());
// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());
// enabling CORS for all requests
app.use(
  cors()
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


//middlewares
app.use("/", userRoute);

const PORT = 3030;
app.listen(PORT, () => {
  console.log("server is listening at port http://localhost:6030");
});



