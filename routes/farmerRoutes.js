const express = require('express');
const { registerFarmer, loginFarmer, getTraders, updateProfile, changePassword, logout, sendOtp } = require('../controllers/farmerController');
const upload = require('../middlewares/multer');
const { authMiddleware } = require('../middlewares/auth');

const farmerRoutes = express.Router();

farmerRoutes.post('/register', upload.single("farmerProfileImage"), registerFarmer);
farmerRoutes.post('/send-otp',  sendOtp);
farmerRoutes.post('/login',  loginFarmer);
farmerRoutes.get('/getTraders/:id', authMiddleware, getTraders);
farmerRoutes.patch('/updateProfile', authMiddleware, upload.single("farmerProfileImage"), updateProfile);
farmerRoutes.patch('/changePassword', authMiddleware, changePassword);
farmerRoutes.patch('/logout', logout);


module.exports = farmerRoutes;