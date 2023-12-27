const router = require('express').Router();
const {register, login, userFromToken, requestPasswordReset, submitPasswordReset, changeMyPassword} = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');
const fileUpload = require('../middlewares/fileUpload');
const {body, param} = require('express-validator');
const validationResultMiddleware = require('../middlewares/validationResultMiddleware');  


// customer/rider register
router.post(
    '/register/:role',
    body('name').notEmpty().withMessage("Name is required"),
    body('email').isEmail().notEmpty().withMessage("Invalid Email"),
    body('password').notEmpty().withMessage("Password is required"),
    validationResultMiddleware,
    // fileUpload.fields([{ name: 'image'}, { name: 'document'}]), 
    register
);
router.post('/login/:role', login);
router.get('/user', userFromToken);

router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', submitPasswordReset);

router.post('/change-password', authMiddleware, changeMyPassword);




module.exports = router;
