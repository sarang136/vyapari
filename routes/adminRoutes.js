const express = require('express');
const { registerAdmin, login, getAllTraders, getAllFarmers, blockTrader, blockFarmer, logout, getAllProducts, deleteFarmer, deleteTrader } = require('../controllers/adminController');
const { authMiddleware } = require('../middlewares/auth');
const { sendOtp } = require('../controllers/adminController');
const adminRouter  =  express.Router();

adminRouter.post('/register', registerAdmin)
// adminRouter.post('/send-otp', sendOtp)
adminRouter.post('/login', login)
adminRouter.get('/get-all-traders', authMiddleware, getAllTraders)
adminRouter.get('/get-all-farmers', authMiddleware, getAllFarmers)
adminRouter.delete('/delete-farmer/:farmerId', authMiddleware, deleteFarmer)
adminRouter.delete('/delete-trader/:traderId', authMiddleware, deleteTrader)
adminRouter.put('/:status/trader/:traderId', authMiddleware, blockTrader)
adminRouter.put('/:status/farmer/:farmerId', authMiddleware, blockFarmer)
adminRouter.get('/get-all-products', authMiddleware, getAllProducts)
adminRouter.post('/logout', logout)

module.exports = adminRouter;