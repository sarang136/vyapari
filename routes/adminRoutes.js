const express = require('express');
const { registerAdmin, login, getAllTraders, getAllFarmers, blockTrader, blockFarmer, logout } = require('../controllers/adminController');
const { authMiddleware } = require('../middlewares/auth');
const adminRouter  =  express.Router();

adminRouter.post('/register', registerAdmin)
adminRouter.post('/login', login)
adminRouter.get('/get-all-traders', authMiddleware, getAllTraders)
adminRouter.get('/get-all-farmers', authMiddleware, getAllFarmers)
// adminRouter.put('/blockTrader/:traderId', authMiddleware, blockTrader)
adminRouter.put('/:status/trader/:traderId', authMiddleware, blockTrader)
adminRouter.put('/:status/farmer/:farmerId', authMiddleware, blockFarmer)
adminRouter.put('/logout', logout)


module.exports = adminRouter;