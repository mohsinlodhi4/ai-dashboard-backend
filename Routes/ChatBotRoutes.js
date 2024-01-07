const router = require('express').Router();
const ChatBotController = require('../controllers/chatBotController');
const {body, param} = require('express-validator');
const validationResultMiddleware = require('../middlewares/validationResultMiddleware');
const imageUpload = require('../middlewares/imageUpload');
const authMiddleware = require('../middlewares/auth');
/** uses auth middleware **/

router.get('/list', authMiddleware, ChatBotController.getChatbots);


router.post('/save', 
    authMiddleware,
    imageUpload.single('image'),
    body('name').notEmpty().withMessage("Name field is required"), 
    validationResultMiddleware,
    ChatBotController.createOrUpdateChatBot )


router.delete('/delete/:id', authMiddleware, ChatBotController.deleteChatBot)

router.get('/:id', ChatBotController.getChatBotDetails);

module.exports = router;
