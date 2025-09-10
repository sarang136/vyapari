const Farmer = require('../models/farmerSchema');
const uploadTheImage = require("../utils/cloudinary");
const Product = require('../models/productSchema');
const fs = require('fs')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SAFE_DATA = ["traderName", "traderProfileImage", "traderAddress", "traderContact", "traderEmail"]
const SELECTED = ["productName", "grade", "totalPrice", "quantity", "traderId", "priceWithoutGrade"]

const registerFarmer = async (req, res) => {
    try {
        const { farmerName, farmerAddress, farmerArea, farmerContact, farmerEmail, farmerPassword } = req.body;

        if (!farmerName || !farmerAddress || !farmerArea || !farmerContact || !farmerEmail || !farmerPassword) {
            return res.status(401).json({ message: "All fields are required" });
        }

        const farmerExists = await Farmer.findOne({ farmerEmail });
        if (farmerExists) {
            return res.status(400).json({ message: "Farmer already registered with this email" });
        }


        let farmerProfileImage = null;
        if (req.file) {
            const uploadResult = await uploadTheImage(req.file.path);
            farmerProfileImage = uploadResult?.secure_url;


            fs.unlinkSync(req.file.path);
        }

        const hashedPassword = await bcrypt.hash(farmerPassword, 10);

        const farmer = new Farmer({
            farmerName,
            farmerAddress,
            farmerArea,
            farmerContact,
            farmerEmail,
            farmerProfileImage,
            farmerPassword: hashedPassword
        });

        await farmer.save();

        res.status(201).json({ message: "Farmer registered successfully", farmer });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const loginFarmer = async (req, res) => {
    try {
        const { farmerContact, farmerPassword } = req.body;
        if (!farmerContact || !farmerPassword) {
            return res.status(408).json({ message: "All fields are required" });
        }
        const farmer = await Farmer.findOne({ farmerContact });
        if (!farmer) {
            return res.status(403).json({ message: "Farmer not found" });
        }
        const isPasswordCorrect = await bcrypt.compare(farmerPassword, farmer.farmerPassword)
        if (!isPasswordCorrect) {
            return res.status(409).json({ message: "Password is not valid" });
        }
        const token = await jwt.sign({ _id: farmer._id }, process.env.JWT_SECRET);
        console.log("token", token)
        farmer.farmerPassword = undefined;
        res
            .cookie("token", token, { httpOnly: true, secure: true, maxAge: 30 * 24 * 60 * 60 * 1000 })
            .status(200)
            .json({
                message: "Trader logged in successfully",
                farmer,
            });

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
const updateProfile = async (req, res) => {
    try {
        const { farmerAddress, farmerArea, farmerContact, farmerEmail } = req.body;
        const farmer = req.farmer;
        console.log("farmer from update", farmer)
        if (farmerContact === farmer.farmerContact) {
            return res.status(403).json({ message: "Old contact and new contact can't be same" })
        }
        if (farmerAddress === farmer.farmerAddress) {
            return res.status(403).json({ message: "Old address and new address can't be same" })
        }
        if (farmerArea === farmer.farmerArea) {
            return res.status(403).json({ message: "Old Area and new Area can't be same" })
        }
        if (farmerEmail === farmer.farmerEmail) {
            return res.status(403).json({ message: "Old Email and new Email can't be same" })
        }
        const updatedData = await Farmer.findByIdAndUpdate(farmer._id, {
            farmerContact,
            farmerAddress,
            farmerArea,
            farmerEmail
        }, { new: true })
        await updatedData.save()
        res.status(200).json({ message: "Data Successfully Updated", data: updatedData })
    } catch (error) {

    }
}
const changePassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const farmer = req.farmer;

        const isSamePassword = await bcrypt.compare(newPassword, farmer.farmerPassword);
        if (isSamePassword) {
            return res.status(403).json({ message: "Old password and new password can't be same" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updatedFarmer = await Farmer.findByIdAndUpdate(
            farmer._id,
            { farmerPassword: hashedPassword },
            { new: true }
        );

        res.status(200).json({
            message: "Password is successfully updated"
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const getTraders = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("farmer id", id)
        const farmer = req.farmer;
        console.log("farmer from controller", farmer)
        if (id !== farmer._id.toString()) {
            return res.status(403).json({ message: "Farmer is not valid" })
        }
        const foundProducts = await Product.find({ farmerId: farmer._id }).select(SELECTED).populate("traderId", SAFE_DATA)
        if (foundProducts.length === 0) {
            return res.status(200).json({ message: "No Products found on this farmer" })
        }
        res.status(200).json({ message: "Hi there", foundProducts })
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

module.exports = { registerFarmer, loginFarmer, getTraders, updateProfile, changePassword };
