require("dotenv").config();
const express = require("express");
const app = express();
//logger, error handler
const { logger } = require("./middlewares/logEvents");
const errorHandler = require("./middlewares/errorHandler");
//cors
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
//cookieparser
const cookieParser = require("cookie-parser");
//db connection
const mongoose = require("mongoose");
const dbConnect = require("./config/dbConnect");
//port
const PORT = process.env.PORT || 5000;
//verify access token mw
const verifyAccessToken = require("./middlewares/verifyAccessToken");

//Connect to mongodb
dbConnect();

//requests logger
app.use(logger);
//Cross Origin Resource Sharing
app.use(cors(corsOptions));
// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));
//built-in middlewares
app.use(express.json());
//middleware for cookies
app.use(cookieParser());

//routes
//auth
app.use("/api/auth", require("./routes/auth"));
//else
app.use(verifyAccessToken);
//catch all
app.all("*", (req, res) => {
  res.status(404).type("txt").send("404 not found");
});

//error handler
app.use(errorHandler);

//only listen if can connect to mongodb
mongoose.connection.once("connected", () => {
  console.log("Connected to MongoDB.");
  app.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`);
  });
});
