const { format } = require("date-fns");
const fs = require("fs");
const fsPromise = require("fs").promises;
const path = require("path");

const logEvents = async (message, logName) => {
  const dateTime = `${format(new Date(), "yyyy/MM/dd - HH:mm:ss")}`;
  const logItem = `${dateTime}\t${message}\n`;

  try {
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      await fsPromise.mkdir(path.join(__dirname, "..", "logs"));
    }

    await fsPromise.appendFile(
      path.join(__dirname, "..", "logs", logName),
      logItem
    );
  } catch (error) {
    console.log(error);
  }
};

const logger = (req, res, next) => {
  logEvents(
    `${req.method}\t${req.headers.origin}\t${req.url}`,
    "requestLog.txt"
  );
  console.log(`${req.method} ${req.path}`);
  next();
};

module.exports = { logEvents, logger };
