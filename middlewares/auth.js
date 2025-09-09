const jwt = require('jsonwebtoken');
const Trader = require('../models/traderSchema');

const authMiddleware = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    console.log("token", token);
    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = decoded;

    const trader = await Trader.findById(_id); 
    if (!trader) {
      return res.status(404).json({ message: "User not found" });
    }

    req.trader = trader;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { authMiddleware };
