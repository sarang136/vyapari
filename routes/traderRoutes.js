const express = require('express');
const upload = require('../middlewares/multer');
const { postGrade, registerTrader, loginTrader, getGrates, deleteGrade, updateGradebyId, addProduct, logout, addVehicle, updateTrader, changeTraderPassword, sendOtp, getFarmers, GetProducts , GetProductsById , deleteProduct , updatepaymentStatus, getAllVehicles} = require('../controllers/traderController');
const { authMiddleware } = require('../middlewares/auth');

const traderRouter = express.Router();

traderRouter.post('/register', upload.single("traderProfileImage"), registerTrader)
traderRouter.post('/send-otp', sendOtp)


traderRouter.post('/login', loginTrader);
traderRouter.patch('/updateTrader',authMiddleware, upload.single("traderProfileImage"), updateTrader);
traderRouter.patch('/changeTraderPassword',authMiddleware, changeTraderPassword);
traderRouter.get('/get-farmers',authMiddleware, getFarmers);
traderRouter.get('/getProducts' , authMiddleware , GetProducts)
traderRouter.get('/getProducts/:id',authMiddleware, GetProductsById)

traderRouter.delete('/deleteGrade/:gradeId',authMiddleware, deleteGrade)
traderRouter.patch('/updateGradebyId/:gradeId',authMiddleware, updateGradebyId)
traderRouter.post('/addProduct/:id',authMiddleware , upload.single("vehiclePhoto") , addProduct)
traderRouter.post('/paymentStatus/:id',authMiddleware, updatepaymentStatus)
traderRouter.delete('/deleteProduct/:id',authMiddleware, deleteProduct)
traderRouter.post('/addVehicle',authMiddleware, addVehicle)
traderRouter.get('/get-all-vehicles',authMiddleware, getAllVehicles)
traderRouter.post('/logout', logout)

module.exports = traderRouter;