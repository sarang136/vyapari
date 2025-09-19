const Farmer = require('../models/farmerSchema');
const uploadTheImage = require("../utils/cloudinary");
const Product = require('../models/productSchema');
const fs = require('fs')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SAFE_DATA = ["traderName", "traderProfileImage", "traderAddress", "traderContact", "traderEmail"]
const SELECTED = ["productName", "grade", "totalPrice", "quantity", "traderId", "priceWithoutGrade"]
const Otp = require('../models/otpSchema');
const twilio = require('twilio');
const account_sid = process.env.ACCOUNT_SID
const auth_token = process.env.AUTH_TOKEN
const twilioClient = new twilio(account_sid, auth_token)
const Trader = require('../models/traderSchema')


const registerFarmer = async (req, res) => {
    try {
        const { farmerName, farmerAddress, farmerArea, farmerContact, farmerEmail, farmerPassword } = req.body;

        if (!farmerName || !farmerAddress || !farmerArea || !farmerContact || !farmerEmail) {
            return res.status(401).json({ message: "All fields are required" });
        }

        const farmerExistInAnotherSchema = await Trader.findOne({ traderContact: farmerContact });
        if (farmerExistInAnotherSchema) {
            console.log("farmerExistInAnotherSchema", farmerExistInAnotherSchema)
            return res.status(400).json({ message: "User already registered as a trader!" });
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


        const farmer = new Farmer({
            farmerName,
            farmerAddress,
            farmerArea,
            farmerContact,
            farmerEmail,
            farmerProfileImage,
            farmerPassword
        });

        await farmer.save();

        res.status(201).json({ message: "Farmer registered successfully", farmer });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const sendOtp = async (req, res) => {
    try {
        const { contact } = req.body;
        // const otp = String(Math.floor(100000 + Math.random() * 900000));
        const otp = 123456;
        // // const traderExists = await Trader.find({traderContact});
        // if(!traderExists){
        //   return res.status(400).json({message : "Trader does not exists"});
        // }
        await Otp.findOneAndUpdate(
            { contact },
            { otp },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )

        // await twilioClient.messages.create({
        //     body: `Otp - ${otp}`,
        //     from: process.env.PHONE_NUMBER,
        //     to: contact.startsWith('+') ? contact : `+91${contact}`,
        // })
        res.status(200).json({ message: `Otp - ${otp}` })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
const loginFarmer = async (req, res) => {
    try {
        const { contact, otp } = req.body;
        if (!contact || !otp) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const farmer = await Farmer.findOne({ farmerContact: contact });
        if (!farmer) {
            return res.status(403).json({ message: "Farmer not found" });
        }
        const isOtpCorrect = await Otp.findOne({ contact, otp });
        if (!isOtpCorrect) {
            return res.status(403).json({ message: "Invalid OTP" });
        }
        await Otp.deleteOne({ contact });
        if (farmer.isActive === false) {
            return res.status(200).json({ message: "Oops ! you have been blocked by the admin" });
        }
        const token = await jwt.sign({ _id: farmer._id }, process.env.JWT_SECRET);

        console.log("token", token)
        farmer.farmerPassword = undefined;
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({ message: "Logged In successfull", farmer: farmer })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
const updateProfile = async (req, res) => {
    try {
        const farmer = req.farmer;
        if (!farmer) {
            return res.status(400).json({ message: "Farmer not valid" })
        }
        const { farmerAddress, farmerArea, farmerContact, farmerEmail } = req.body;
        console.log("farmer from update", farmer)
        let farmerProfileImage = null;
        if (req.file) {
            const uploadResult = await uploadTheImage(req.file.path);
            farmerProfileImage = uploadResult?.secure_url;


            fs.unlinkSync(req.file.path);
        }
        const updatedData = await Farmer.findByIdAndUpdate(farmer._id, {
            farmerContact,
            farmerAddress,
            farmerArea,
            farmerEmail,
            farmerProfileImage
        }, { new: true })

        await updatedData.save()
        res.status(200).json({ message: "Data Successfully Updated" })
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
const logout = async (req, res) => {
    try {
        res.clearCookie("token");
        res.status(200).json({ message: "logout successfull" })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { registerFarmer, sendOtp, loginFarmer, getTraders, updateProfile, changePassword, logout };
