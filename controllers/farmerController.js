const Farmer = require('../models/farmerSchema');
const uploadTheImage = require("../utils/cloudinary");
const fs = require('fs')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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


module.exports = { registerFarmer, loginFarmer };
