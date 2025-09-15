const Admin = require('../models/adminSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Trader = require('../models/traderSchema');
const Product = require('../models/productSchema');
const Farmer = require('../models/farmerSchema');

// const Select_for_Traders = [""]

const registerAdmin = async (req, res) => {
    try {
        const { adminName, adminContact, adminEmail, adminPassword } = req.body;
        if (!adminName || !adminContact || !adminEmail || !adminPassword) {
            return res.status(400).json({ message: "Required all the fields" });
        }
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const adminAdded = new Admin({
            adminName,
            adminContact,
            adminEmail,
            adminPassword: hashedPassword
        })
        await adminAdded.save();
        res.status(200).json({ message: "Registered Successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
};
const login = async (req, res) => {
    try {
        const { adminContact, adminPassword } = req.body;
        console.log("adminPassword", adminPassword)
        if (!adminContact || !adminPassword) {
            return res.status(403).json({ message: "All feilds are required" });
        }
        const adminExists = await Admin.findOne({ adminContact });
        if (!adminExists) {
            return res.status(403).json({ message: "Admin does not exists." })
        }
        const isPasswordValid = await bcrypt.compare(adminPassword, adminExists.adminPassword);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" })
        }
        adminExists.adminPassword = undefined;
        const token = jwt.sign(
            { _id: adminExists._id },
            process.env.JWT_SECRET,
        );
        console.log("token", token);

        res.cookie("token", token, {
            httpOnly: true,         
            secure: true,            
            sameSite: "None",        
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({message : "logged In successfull", data : adminExists})
    } catch (error) {
        // 
        res.status(500).json({ error: error.message })
    }
};
const getAllTraders = async (req, res) => {
    try {
        const admin = req.admin;
        if (!admin) {
            return res.status(400).json({ message: "Admin not valid" });
        }
        const getTraders = await Trader.find({}, "-traderPassword");
        if (!getTraders) {
            return res.status(403).json({ message: "No traders found" });
        }
        res.status(200).json({ message: "Traders", data: getTraders })
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
const getAllFarmers = async (req, res) => {
    try {
        const admin = req.admin;
        if (!admin) {
            return res.status(400).json({ message: "Admin not valid" });
        }
        const farmers = await Farmer.find({}, "-farmerPassword");
        if (!farmers) {
            return res.status(200).json({ message: "No farmers found" });
        }
        res.status(200).json({ message: "Farmers", data: farmers });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const blockTrader = async (req, res) => {
    try {
        const admin = req.admin;
        const { traderId, status } = req.params;

        if (!traderId) {
            return res.status(404).json({ message: "Trader id is required" })
        }
        if (!admin) {
            return res.status(400).json({ message: "Admin is not valid" });
        }
        const validStatuses = ["block", "unblock"];
        if (!validStatuses.includes(status)) {
            return res.status(403).json({ message: "Invalid status" });
        }

        const trader = await Trader.findById(traderId);
        if (!trader) {
            return res.status(404).json({ message: "Trader not found" });
        }


        trader.isActive = status === "unblock";
        await trader.save();

        res.status(200).json({
            message: `${trader.traderName} is successfully ${status}ed!`
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const blockFarmer = async (req, res) => {
    try {
        const admin = req.admin;
        const { farmerId, status } = req.params;

        if (!farmerId) {
            return res.status(404).json({ message: "Trader id is required" })
        }
        if (!admin) {
            return res.status(400).json({ message: "Admin is not valid" });
        }
        const validStatuses = ["block", "unblock"];
        if (!validStatuses.includes(status)) {
            return res.status(403).json({ message: "Invalid status" });
        }

        const farmer = await Farmer.findById(farmerId);
        if (!farmer) {
            return res.status(404).json({ message: "Farmer not found" });
        }


        farmer.isActive = status === "unblock";
        await farmer.save();

        res.status(200).json({
            message: `${farmer.farmerName} is successfully ${status}ed!`
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({})
        .populate('traderId', "traderContact")
        if (!products || (products.length === 0)) {
            return res.status(200).json({ message: "No products found" });
        }
        res.status(200).json({ message: "success", products: products });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const logout = async (req, res) => {
    try {
        res.clearCookie("token");
        res.status(200).json({ message: "logout successfull" })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
};
module.exports = { registerAdmin, login, getAllTraders, getAllFarmers, blockTrader, blockFarmer, getAllProducts, logout }