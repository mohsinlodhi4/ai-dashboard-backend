const router = require('express').Router();

const authMiddleware = require('../middlewares/auth');
const authRouter = require('./AuthRoutes');
const chatRouter = require('./ChatRoutes');
const profileRouter = require('./ProfileRoutes');

router.use('/auth',authRouter);
router.use('/chat', authMiddleware, chatRouter);
router.use('/profile', authMiddleware, profileRouter);

module.exports = router;