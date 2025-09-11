const express = require('express');
const { registerFarmer, loginFarmer, getTraders, updateProfile, changePassword, logout } = require('../controllers/farmerController');
const upload = require('../middlewares/multer');
const { authMiddleware } = require('../middlewares/auth');

const farmerRoutes = express.Router();

farmerRoutes.post('/register', upload.single("farmerProfileImage"), registerFarmer);
farmerRoutes.post('/login',  loginFarmer);
farmerRoutes.get('/getTraders/:id', authMiddleware, getTraders);
farmerRoutes.patch('/updateProfile', authMiddleware, updateProfile);
farmerRoutes.patch('/changePassword', authMiddleware, changePassword);
farmerRoutes.patch('/logout', authMiddleware, logout);


module.exports = farmerRoutes;