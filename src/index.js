const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');


const app = express();
const connectDB = require("./dbConnect.js");
const dotenv = require('dotenv');

<<<<<<< HEAD
<<<<<<< HEAD
const PORT = process.env.PORT || 6030;
=======
>>>>>>> d75d76c0419c7ddd5c8f674a626d6b63328c3e82
=======
>>>>>>> d75d76c0419c7ddd5c8f674a626d6b63328c3e82
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


//import routes
const userRoute = require('../routes/userRoute');


// const auth = require("../src/users/middleware/auth");

// app.post("/welcome", auth, (req, res) => {
//   res.status(200).send("Welcome 🙌 ");
// });

//middlewares
app.use("/", userRoute);



const PORT = process.env.PORT || 6030;
app.listen(PORT, () => {
  console.log("server is listening at port http://localhost:6030");
});