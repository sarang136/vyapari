const express = require('express');
const upload = require('../middlewares/multer');
const { postGrade, registerTrader, loginTrader, getGrates, deleteGrade, updateGradebyId, addProduct, logout, addVehicle, updateTrader, changeTraderPassword, sendOtp } = require('../controllers/traderController');
const { authMiddleware } = require('../middlewares/auth');

const traderRouter = express.Router();

traderRouter.post('/register', upload.single("traderProfileImage"), registerTrader)
traderRouter.post('/send-otp', sendOtp)
traderRouter.post('/login', loginTrader);
traderRouter.patch('/updateTrader',authMiddleware, updateTrader);
traderRouter.patch('/changeTraderPassword',authMiddleware, changeTraderPassword);
// traderRouter.post('/post-grade/:id', authMiddleware, postGrade);
// traderRouter.get('/getGrades/:id',authMiddleware, getGrates)
traderRouter.delete('/deleteGrade/:gradeId',authMiddleware, deleteGrade)
traderRouter.patch('/updateGradebyId/:gradeId',authMiddleware, updateGradebyId)
traderRouter.post('/addProduct/:id',authMiddleware, addProduct)
traderRouter.post('/addVehicle',authMiddleware, addVehicle)
traderRouter.post('/logout', logout)

module.exports = traderRouter;