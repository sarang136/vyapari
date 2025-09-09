const express = require('express');
const { registerFarmer, loginFarmer } = require('../controllers/farmerController');
const upload = require('../middlewares/multer');

const farmerRoutes = express.Router();

farmerRoutes.post('/register', upload.single("farmerProfileImage"), registerFarmer);
farmerRoutes.post('/login',  loginFarmer);


module.exports = farmerRoutes;