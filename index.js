require("dotenv").config();
const express = require("express");
const app = express();
//cors
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
//cookieparser
const cookieParser = require("cookie-parser");
//port
const PORT = process.env.PORT || 5000;

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
//app.use("/api/auth", require("./routes/auth"));
//else
//catch all
app.all("*", (req, res) => {
  res.status(404).type("txt").send("404 not found");
});

app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
