const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');


const app = express();
const connectDB = require("./dbConnect.js");
const dotenv = require('dotenv');

//Load Config
dotenv.config();
connectDB();

app.use(express.json());
  
  // adding Helmet to enhance your Rest API's security
  app.use(helmet());
  
  // using bodyParser to parse JSON bodies into JS objects
  app.use(bodyParser.json());
  
  // enabling CORS for all requests
  app.use(cors());
  
  app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
  
  // adding morgan to log HTTP requests
  app.use(morgan('combined'));


//import routes
const userRoute = require('../routes/userRoute');
const paymentRoutes=require('../routes/paymentRoutes')

// const auth = require("../src/users/middleware/auth");

// app.post("/welcome", auth, (req, res) => {
//   res.status(200).send("Welcome 🙌 ");
// });

//middlewares
app.use("/", userRoute);
app.use("/",paymentRoutes)


const PORT = process.env.PORT || 6030;
app.listen(PORT, () => {
  console.log("server is listening at port http://localhost:6030");
});