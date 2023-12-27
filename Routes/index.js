const router = require('express').Router();

const authMiddleware = require('../middlewares/auth');
const authRouter = require('./AuthRoutes');
const chatRouter = require('./ChatRoutes');

router.use('/auth',authRouter);
router.use('/chat', authMiddleware, chatRouter);

module.exports = router;