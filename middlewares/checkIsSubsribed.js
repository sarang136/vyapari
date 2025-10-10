const Trader = require("../models/traderSchema");

const checkSubscription = async (req, res, next) => {
  try {
    const trader = req.trader;

    if (!trader) {
      return res.status(401).json({ message: "Trader not authenticated" });
    }

    const traderData = await Trader.findById(trader._id);

    if (!traderData) {
      return res.status(404).json({ message: "Trader not found" });
    }

    if (!traderData.isSubscribed) {
      return res.status(403).json({
        message: "Your subscription has expired. Please upgrade your plan to continue."
      });
    }

    next();

  } catch (error) {
    console.error("Subscription check error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = checkSubscription;
