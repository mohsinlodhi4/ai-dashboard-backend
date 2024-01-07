const router = require('express').Router();

const authMiddleware = require('../middlewares/auth');
const authRouter = require('./AuthRoutes');
const chatRouter = require('./ChatRoutes');
const profileRouter = require('./ProfileRoutes');
const chatBotRouter = require('./ChatBotRoutes');
router.use('/auth',authRouter);
router.use('/profile', authMiddleware, profileRouter);
// router.use('/chat', authMiddleware, chatRouter);
router.use('/chatbot', chatBotRouter);

module.exports = router;