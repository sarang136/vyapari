const Grade = require('../models/gradeSchema');
const Trader = require('../models/traderSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Farmer = require('../models/farmerSchema')
const Product = require('../models/productSchema')
const fs = require("fs");
const Otp = require('../models/otpSchema');
const twilio = require('twilio'); 
const uploadTheImage = require("../utils/cloudinary");

const account_sid = process.env.ACCOUNT_SID
const auth_token = process.env.AUTH_TOKEN

const twilioClient = new twilio(account_sid, auth_token)

const registerTrader = async (req, res) => {
  try {
    const { traderName, traderEmail, traderPassword, traderAddress, traderArea, traderContact } = req.body;

    if (!traderName || !traderEmail || !traderAddress || !traderArea || !traderContact) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existsInAnotherSchema = await Farmer.findOne({ farmerContact: traderContact });
    if (existsInAnotherSchema) {
      return res.status(400).json({ message: "User Already exists as farmer" });
    }
    const existingTrader = await Trader.findOne({ traderEmail });
    const existingTraderByNumber = await Trader.findOne({ traderContact });
    if (existingTrader || existingTraderByNumber) {
      return res.status(409).json({ message: "User already Exists" });
    }


    let traderProfileImage = null;
    if (req.file) {
      const uploadResult = await uploadTheImage(req.file.path);
      traderProfileImage = uploadResult?.secure_url;


      fs.unlinkSync(req.file.path);
    }

    const trader = new Trader({
      traderName,
      traderEmail,
      traderPassword,
      traderAddress,
      traderArea,
      traderContact,
      traderProfileImage,
    });

    await trader.save();
    res.status(201).json({ message: "Trader registered successfully", data: trader });
  } catch (error) {
    // console.error("Error in registerTrader:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const sendOtp = async (req, res) => {
  try {
    const { contact } = req.body;
    // console.log("contact", contact);
    // const otp = String(Math.floor(100000 + Math.random() * 900000));

    const otp = 123456

    // await Otp.findOneAndUpdate(
    //   { contact },
    //   { otp },
    //   { upsert: true, new: true, setDefaultsOnInsert: true }
    // )

    // await twilioClient.messages.create({
    //   body: `Otp - ${otp}`,
    //   from: process.env.PHONE_NUMBER,
    //   to: contact.startsWith('+') ? contact : `+91${contact}`,
    // }) 

    res.status(200).json({ message: `Otp - ${otp}` })
  } catch (error) {
    // console.log(error)
    res.status(500).json({ error: error.message })
  }
}
const loginTrader = async (req, res) => {
  try {
    const { contact, otp } = req.body;

    const trader = await Trader.findOne({ traderContact: contact }).select("+traderPassword");
    if (!trader) {
      return res.status(400).json({ message: "Trader not found" });
    }

    if (trader.isActive === false) {
      return res.status(403).json({ message: "Oops! You have been blocked by the admin" });
    }

    // const isOtpCorrect = await Otp.findOne({ contact, otp });
    // if (!isOtpCorrect) {
    //   return res.status(403).json({ message: "Invalid OTP" });
    // }

    await Otp.deleteOne({ contact });

    const token = jwt.sign({ _id: trader._id }, process.env.JWT_SECRET);

    trader.traderPassword = undefined;

    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "None",
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000
      })
      .status(200)
      .json({
        message: "Trader logged in successfully",
        trader,
        token : token
      });

  } catch (error) {
    // console.error("Error in loginTrader:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const updateTrader = async (req, res) => {
  try {
    const trader = req.trader;
    const { traderEmail, traderAddress, traderArea, traderContact } = req.body;


    let traderProfileImage = null;
    if (req.file) {
      const uploadResult = await uploadTheImage(req.file.path);
      traderProfileImage = uploadResult?.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const updatedData = await Trader.findOneAndUpdate(trader._id, {
      traderEmail,
      traderAddress,
      traderArea,
      traderContact,
      traderProfileImage
    }, { new: true })

    await updatedData.save();
    res.status(200).json({ message: "Data Updated Successfully", updatedData });
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
const changeTraderPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const trader = req.trader;
    const isSamePassword = await bcrypt.compare(newPassword, trader.traderPassword);
    if (isSamePassword) {
      return res.status(403).json({ message: "Old password and new password can't be same" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedPassword = await Trader.findByIdAndUpdate(trader._id, {
      traderPassword: hashedPassword
    }, { new: true });
    res.status(200).json({
      message: "Password is successfully updated"
    });


  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
const getFarmers = async (req, res) => {
  try {
    const trader = req.trader;
    if (!trader) {
      return res.status(400).json({ message: "Trader invalid" })
    }
    const products = await Product.find({ traderId: trader._id })
    res.status(200).json({ message: "success", products });

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
const deleteGrade = async (req, res) => {
  try {
    const { gradeId } = req.params;
    const trader = req.trader;
    // console.log("trader", trader)
    // console.log("id", gradeId)
    
    if (!gradeId) {
      return res.status(400).json({ message: "Grade id is required" });
    }

    const gradeFound = trader.grades.id(gradeId);

    if (!gradeFound) {
      return res.status(404).json({ message: "Grade not found" });
    }

    gradeFound.deleteOne();

    await trader.save();

    res.status(200).json({ message: "Grade deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const updateGradebyId = async (req, res) => {
  try {
    const { gradeId } = req.params;
    const trader = req.trader;
    const { grade, price } = req.body;
    if (!gradeId) {
      return res.status(400).json({ message: "Grade id is required" })
    }
    const gradeFound = trader.grades.id(gradeId);
    // console.log("Grade Found", gradeFound);
    if (!gradeFound) {
      return res.status(403).json({ message: "Grade id is not valid" })
    }

    const gradeAlreadyExists = trader.grades.some(
      (g) => g.grade.toLowerCase() === grade.toLowerCase()
    );

    if (gradeAlreadyExists) {
      return res.status(400).json({ message: "Grade already exists" });
    }

    // console.log(gradeAlreadyExists);
    if (grade) gradeFound.grade = grade
    if (price) gradeFound.price = price

    await trader.save();
    res.status(200).json({ message: "Grade updated successfully", data: trader?.grades })
    if (!gradeId) {
      return res.status(404).json({ message: "Grade id is required" });
    }


  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
const addProduct = async (req, res) => {
    try {
      const trader = req.trader;
      const { id } = req.params;
      const products = Array.isArray(req.body) ? req.body : [req.body];

      console.log(trader);
      console.log(id);


      console.log("Body Way : ", req.body)
      console.log("File Way : ", req.file)

      // req.file = req.body.vehiclePhoto
      if (!id) {
        return res.status(403).json({ message: "Trader id is required" });
      }
      if (!trader) {
        return res.status(402).json({ message: "Trader not found" });
      }
      // if (id.toString() !== trader._id.toString()) {
      //   return res.status(403).json({ message: "Trader id is not valid" });
      // }

      let savedProducts = [];

      for (const productData of products) {
        const {
          productName,
          farmerName,
          traderName,
          grade,
          gradePrice,
          priceWithoutGrade,
          totalPrice,
          quantity,
          weight,
          BillType,
          // vehicleName,
          vehicleNumber,
          farmerContact,
          paymentStatus,
          deliveryWay,
        } = productData;


        if (deliveryWay === "delivered" && req.file) {
          const uploadResult = await uploadTheImage(req.file.path);
          Vehiclephoto = uploadResult?.secure_url;
          fs.unlinkSync(req.file.path);
        }

       
        if (
          !productName ||
          !farmerName ||
          !farmerContact ||
          !traderName ||
          // (!grade && !priceWithoutGrade) ||
          // (!grade && !gradePrice) ||
          (BillType === "Shimla" ? !priceWithoutGrade : !grade || !gradePrice) ||
          !totalPrice ||
          !quantity ||
          !BillType ||
          !deliveryWay ||
          !paymentStatus ||
          // (deliveryWay === "delivered" && !vehicleName) ||
          (deliveryWay === "delivered" && !vehicleNumber)
        ) {
          return res.status(400).json({
            message: "All required fields must be filled properly",
            invalidProduct: productData,
          });
        }
        // const vehicleExists = await Veh

        const product = new Product({
          productName,
          farmerName,
          farmerContact,
          traderName,
          grade,
          gradePrice,
          priceWithoutGrade,
          totalPrice,
          quantity,
          weight,
          BillType,
          // vehicleName: deliveryWay === "delivered" ? vehicleName : null,
          vehicleNumber: deliveryWay === "delivered" ? vehicleNumber : null,
          // vehiclePhoto: Vehiclephoto,
          deliveryWay,
          paymentStatus,
          traderId: trader._id,
        });

        const addedProduct = await product.save();
        savedProducts.push(addedProduct);
      }

      res.status(200).json({
        message: `${savedProducts.length} product(s) added successfully`,
        data: savedProducts,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};
const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logout Successfull" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
const addVehicle = async (req, res) => {
  try {
    const trader = req.trader;
    let vehicles = req.body;

    // Normalize vehicles into an array
    if (!Array.isArray(vehicles)) {
      vehicles = [vehicles]; // wrap single object into array
    }

    if (vehicles.length === 0) {
      return res.status(400).json({ message: "At least one vehicle is required" });
    }

    // Validate and push each vehicle
    for (const v of vehicles) {
      if (!v.vehicleName || !v.vehicleNumber) {
        return res.status(400).json({ message: "Each vehicle must have name and number" });
      }
      trader.vehicle.push({
        vehicleName: v.vehicleName,
        vehicleNumber: v.vehicleNumber
      });
    }

    await trader.save();

    // Exclude password
    const traderWithoutPassword = trader.toObject();
    delete traderWithoutPassword.password;

    res.status(200).json({
      message: "Vehicle(s) added successfully",
      trader: traderWithoutPassword
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const GetProducts = async (req, res) => {
  try {
    const trader = req.trader;

    if (!trader) {
      return res.status(400).json({ message: "Trader invalid" })
    }

    const products = await Product.find();
    res.status(200).json({ message: "Products fetched successfully", data: products });

  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message });
  }
}
const GetProductsById = async (req, res) => {
  try {
    const trader = req.trader;
    const { id } = req.params;
    if (!trader) {
      return res.status(400).json({ message: "Trader invalid" })
    }
    if (!id) {
      return res.status(400).json({ message: "Product id is required" })
    }
    const products = await Product.find({ traderId: id });
    res.status(200).json({ message: "Products fetched successfully", data: products });

  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message });
  }
}
const deleteProduct = async (req, res) => {
  try {

    const trader = req.trader;
    const { id } = req.params;

    if (!trader) {
      return res.status(400).json({ message: "Trader invalid" })
    }
    if (!id) {
      return res.status(400).json({ message: "Product id is required" })
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.traderId.toString() !== trader._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this product" });
    }

    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
const updatepaymentStatus = async (req, res) => {
  try {

    const trader = req.trader;
    const { id } = req.params;
    const { paymentStatus } = req.body;

    if (!trader) {
      return res.status(400).json({ message: "Trader invalid" })
    }
    if (!id) {
      return res.status(400).json({ message: "Product id is required" })
    }

    let product = await Product.findByIdAndUpdate(id, { paymentStatus }, { new: true });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }
    res.status(200).json({ message: "Payment status updated successfully", data: product })

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { updatepaymentStatus, deleteProduct, GetProductsById, GetProducts, registerTrader, loginTrader, deleteGrade, updateGradebyId, addProduct, logout, addVehicle, updateTrader, changeTraderPassword, getFarmers, sendOtp };