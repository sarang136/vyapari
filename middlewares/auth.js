const jwt = require('jsonwebtoken');
const Trader = require('../models/traderSchema');
const Farmer = require('../models/farmerSchema')
const Admin = require('../models/adminSchema');

const authMiddleware = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    console.log("token", token);

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded", decoded);
    const { _id } = decoded;

    // Check trader
    const trader = await Trader.findById(_id);
    if (trader) {
      req.trader = trader;
      return next();
    }
    // Check farmer
    const farmer = await Farmer.findById(_id);
    if (farmer) {
      req.farmer = farmer;
      return next();
    }
    const admin = await Admin.findById(_id);
    console.log("Admin from middleware", admin)
    if (admin) {
      req.admin = admin;
      return next();
    }

    // If neither found
    return res.status(404).json({ message: "User not found" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

 module.exports = { authMiddleware };