const express = require('express');
const upload = require('../middlewares/multer');
const { postGrade, registerTrader, loginTrader, getGrates, deleteGrade, updateGradebyId, addProduct, logout, addVehicle, updateTrader, changeTraderPassword, sendOtp, getFarmers, GetProducts, GetProductsById, deleteProduct, updatepaymentStatus, getAllVehicles, buySubscriptions } = require('../controllers/traderController');
const { authMiddleware } = require('../middlewares/auth');
const checkSubscription = require('../middlewares/checkIsSubsribed');

const traderRouter = express.Router();

traderRouter.post('/register', upload.single("traderProfileImage"), registerTrader)
traderRouter.post('/send-otp', sendOtp)


traderRouter.post('/login', loginTrader);
traderRouter.patch('/updateTrader', authMiddleware, upload.single("traderProfileImage"),checkSubscription, updateTrader);
traderRouter.patch('/changeTraderPassword', authMiddleware,checkSubscription, changeTraderPassword);
traderRouter.get('/get-farmers', authMiddleware,checkSubscription, getFarmers);
traderRouter.get('/getProducts', authMiddleware,checkSubscription, GetProducts)
traderRouter.get('/getProducts/:id', authMiddleware,checkSubscription, GetProductsById)

traderRouter.delete('/deleteGrade/:gradeId', authMiddleware,checkSubscription, deleteGrade)
traderRouter.patch('/updateGradebyId/:gradeId', authMiddleware,checkSubscription, updateGradebyId)
traderRouter.post('/addProduct/:id', authMiddleware, upload.single("vehiclePhoto"),checkSubscription, addProduct)
traderRouter.post('/paymentStatus/:id', authMiddleware,checkSubscription, updatepaymentStatus)
traderRouter.delete('/deleteProduct/:id', authMiddleware,checkSubscription, deleteProduct)
traderRouter.post('/addVehicle', authMiddleware, checkSubscription,checkSubscription, addVehicle)
traderRouter.get('/get-all-vehicles', authMiddleware,checkSubscription, getAllVehicles)
traderRouter.post('/logout', logout)

// New apis
traderRouter.post('/buy/:id', authMiddleware, buySubscriptions)


module.exports = traderRouter;