const allowedOrigins = require("./allowedOrigins");
const { logEvents } = require("../middlewares/logEvents");

const corsOptions = {
  origin: (origin, callback) => {
    logEvents(`${origin}`, "requestLog.txt");
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      //error: null, sameOrigin: true
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = corsOptions;
