const router = require('express').Router();
const ChatBotController = require('../controllers/chatBotController');
const {body, param} = require('express-validator');
const validationResultMiddleware = require('../middlewares/validationResultMiddleware');
const imageUpload = require('../middlewares/imageUpload');
const authMiddleware = require('../middlewares/auth');
/** uses auth middleware **/

router.get('/list', authMiddleware, ProfileController.getCompanyProfile);


router.post('/save', 
authMiddleware,
body('name').notEmpty().withMessage("Name field is required"), 
validationResultMiddleware,
imageUpload.single('image'),
ChatBotController.createOrUpdateChatBot )


// after completing profile
router.post('/mark-as-complete', ProfileController.markProfileAsComplete)
router.get('/:id', authMiddleware, ProfileController.getCompanyProfile);
router.get('/:id', authMiddleware, ProfileController.getCompanyProfile);

module.exports = router;
