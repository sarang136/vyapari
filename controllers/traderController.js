const Grade = require('../models/gradeSchema');
const Trader = require('../models/traderSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Farmer = require('../models/farmerSchema')
const Product = require('../models/productSchema')
const fs = require("fs");

const uploadTheImage = require("../utils/cloudinary");

const registerTrader = async (req, res) => {
  try {
    const { traderName, traderEmail, traderPassword, traderAddress, traderArea, traderContact } = req.body;

    if (!traderName || !traderEmail || !traderPassword || !traderAddress || !traderArea || !traderContact) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existingTrader = await Trader.findOne({ traderEmail });
    const existingTraderByNumber = await Trader.findOne({ traderContact });
    if (existingTrader || existingTraderByNumber) {
      return res.status(409).json({ message: "User already Exists" });
    }

    const hashedPassword = await bcrypt.hash(traderPassword, 10);

    let traderProfileImage = null;
    if (req.file) {
      const uploadResult = await uploadTheImage(req.file.path);
      traderProfileImage = uploadResult?.secure_url;


      fs.unlinkSync(req.file.path);
    }

    const trader = new Trader({
      traderName,
      traderEmail,
      traderPassword: hashedPassword,
      traderAddress,
      traderArea,
      traderContact,
      traderProfileImage,
    });

    await trader.save();
    res.status(201).json({ message: "Trader registered successfully" });
  } catch (error) {
    console.error("Error in registerTrader:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const loginTrader = async (req, res) => {
  try {
    const { traderContact, traderPassword } = req.body;

    const trader = await Trader.findOne({ traderContact }).select("+traderPassword");
    if (!trader) {
      return res.status(400).json({ message: "Trader not found" });
    }

    if (trader.isActive === false) {
      return res.status(200).json({ message: "Oops ! you have been blocked by the admin" });
    }

    const isPasswordCorrect = await bcrypt.compare(traderPassword, trader.traderPassword);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { _id: trader._id },
      process.env.JWT_SECRET,
    );

    console.log("token", token);
    trader.traderPassword = undefined;

    res
      .cookie("token", token, { httpOnly: true, secure: true, maxAge: 30 * 24 * 60 * 60 * 1000 })
      .status(200)
      .json({
        message: "Trader logged in successfully",
        trader,
      });
  } catch (error) {
    console.error("Error in loginTrader:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const updateTrader = async (req, res) => {
  try {
    const trader = req.trader;
    const { traderEmail, traderAddress, traderArea, traderContact } = req.body;
    if (traderEmail === trader.traderEmail) {
      return res.status(403).json({ message: "Old Email and New Email can't be same" })
    }
    const updatedData = await Trader.findOneAndUpdate(trader._id, {
      traderEmail,
      traderAddress,
      traderArea,
      traderContact
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
// const postGrade = async (req, res) => {
//   try {
//     const trader = req.trader;
//     const { grade, price } = req.body;

//     if (!grade || !price) {
//       return res.status(400).json({ message: "All fields are required" });
//     }


//     const gradeAlreadyExists = trader.grades.some(
//       (g) => g.grade.toLowerCase() === grade.toLowerCase()
//     );

//     if (gradeAlreadyExists) {
//       return res.status(400).json({ message: "Grade already exists" });
//     }

//     trader.grades.push({ grade: grade, price: price });

//     await trader.save();

//     res.status(200).json({ message: "Grade added successfully", grades: trader.grades });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
// const getGrates = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const trader = req.trader;
//     console.log("id", id)
//     console.log("trader._id", trader._id)
//     if (id !== trader._id.toString()) {
//       return res.status(403).json({ message: "trader id is required" })
//     }
//     const gradesFound = await Trader.findById(trader._id);
//     console.log(gradesFound);
//     if (!gradesFound) {
//       return res.status(403).json({ message: "Trader not found" })
//     }
//     if (gradesFound.grades.length === 0) {
//       return res.status(200).json({ message: " No grades found" })
//     }
//     res.status(200).json({ message: gradesFound?.grades })
//   } catch (error) {
//     res.status(500).json({ error: error.message })
//   }
// }
const deleteGrade = async (req, res) => {
  try {
    const { gradeId } = req.params;
    const trader = req.trader;
    console.log("trader", trader)

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
    console.log("Grade Found", gradeFound);
    if (!gradeFound) {
      return res.status(403).json({ message: "Grade id is not valid" })
    }

    const gradeAlreadyExists = trader.grades.some(
      (g) => g.grade.toLowerCase() === grade.toLowerCase()
    );

    if (gradeAlreadyExists) {
      return res.status(400).json({ message: "Grade already exists" });
    }

    console.log(gradeAlreadyExists);
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

    if (!id) {
      return res.status(403).json({ message: "Trader id is required" });
    }
    if (!trader) {
      return res.status(402).json({ message: "Trader not found" });
    }
    if (id !== trader._id.toString()) {
      return res.status(403).json({ message: "Trader id is not valid" });
    }

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
        farmerContact,
        paymentStatus,
        deliveryWay
      } = productData;

      // 🔎 Validations
      if (
        !productName ||
        !farmerName ||
        !farmerContact ||
        !traderName ||
        (!grade && !priceWithoutGrade) ||
        (grade && !gradePrice) ||
        !totalPrice ||
        !quantity ||
        !deliveryWay ||
        !paymentStatus
      ) {
        return res.status(400).json({
          message: "All required fields must be filled properly",
          invalidProduct: productData,
        });
      }

      if (traderName !== trader.traderName) {
        return res.status(403).json({ message: "Trader Name is not valid" });
      }

      const farmerFound = await Farmer.findOne({ farmerContact, farmerName });
      if (!farmerFound) {
        return res.status(403).json({ message: "Farmer not found or invalid details" });
      }

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
        deliveryWay,
        paymentStatus,
        farmerId: farmerFound._id,
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
    const { vehicleName, vehicleNumber } = req.body;
    if (!vehicleName || !vehicleNumber) {
      return res.status(403).json({ message: "Required all the fields" })
    }


    trader.vehicle.vehicleName = vehicleName
    trader.vehicle.vehicleNumber = vehicleNumber

    await trader.save()
    res.status(200).json({ message: "Vehicle added successfully", trader })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}


module.exports = {  registerTrader, loginTrader, deleteGrade, updateGradebyId, addProduct, logout, addVehicle, updateTrader, changeTraderPassword };
