const jwt = require("jsonwebtoken");
const Token = require("../models/tokenModel");

const authenticateToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(
      token,
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
    );
    const blacklisted = await Token.findOne({ token });

    if (!blacklisted) {
      return res
        .status(401)
        .send({ error: "Token blacklisted. Please log in again." });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).send({ error: error });
  }
};

module.exports = authenticateToken;
