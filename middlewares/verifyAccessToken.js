const jwt = require("jsonwebtoken");

const verifyAccessToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      clientMsg: "Unauthorized.",
      error: "No auth header was presented.",
    });
  }
  //Bearer *token*
  const token = authHeader.split(" ")[1];
  //verify token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decodedData) => {
    if (error) {
      return res.status(403).json({
        clientMsg: "Forbidden.",
        error: "Invalid access token.",
      });
    }
    next();
  });
};

module.exports = verifyAccessToken;
