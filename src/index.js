const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const app = express();
const connectDB = require("./dbConnect.js");
const dotenv = require('dotenv');

const PORT = process.env.PORT || 6031;
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
  
  // adding morgan to log HTTP requests
  app.use(morgan('combined'));

const userRoute = require('../routes/userRoute');
//app.use("/", require('../routes/listingRoute'));
app.use("/", userRoute);

app.listen(PORT, () => {
  console.log("server is listening at port http://localhost:6031");
});