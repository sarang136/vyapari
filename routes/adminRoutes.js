const express = require('express');
const { registerAdmin, login, getAllTraders, getAllFarmers, blockTrader, blockFarmer, logout, getAllProducts } = require('../controllers/adminController');
const { authMiddleware } = require('../middlewares/auth');
const adminRouter  =  express.Router();

adminRouter.post('/register', registerAdmin)
adminRouter.post('/login', login)
adminRouter.get('/get-all-traders', authMiddleware, getAllTraders)
adminRouter.get('/get-all-farmers', authMiddleware, getAllFarmers)
adminRouter.put('/:status/trader/:traderId', authMiddleware, blockTrader)
adminRouter.put('/:status/farmer/:farmerId', authMiddleware, blockFarmer)
adminRouter.get('/get-all-products', authMiddleware, getAllProducts)
adminRouter.post('/logout', logout)

module.exports = adminRouter;