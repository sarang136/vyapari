const express = require('express');
const upload = require('../middlewares/multer');
const { postGrade, registerTrader, loginTrader, getGradesByTraderId, getGrates, deleteGrade, updateGradebyId, addProduct } = require('../controllers/traderController');
const { authMiddleware } = require('../middlewares/auth');

const traderRouter = express.Router();

traderRouter.post('/register', upload.single("traderProfileImage"), registerTrader)
traderRouter.post('/login', loginTrader);
traderRouter.post('/post-grade/:id', authMiddleware, postGrade);
traderRouter.get('/getGrades/:id',authMiddleware, getGrates)
traderRouter.delete('/deleteGrade/:gradeId',authMiddleware, deleteGrade)
traderRouter.patch('/updateGradebyId/:gradeId',authMiddleware, updateGradebyId)
traderRouter.post('/addProduct/:id',authMiddleware, addProduct)


module.exports = traderRouter;