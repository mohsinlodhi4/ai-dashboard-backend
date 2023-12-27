const router = require('express').Router();
const ChatController = require('../controllers/chatController');
const {body, param} = require('express-validator');
const validationResultMiddleware = require('../middlewares/validationResultMiddleware');  
// const adminMiddleware = require('../middlewares/admin');

/** uses auth middleware **/

router.post('/send-message', 
body('text').notEmpty().withMessage("text field is required"), 
validationResultMiddleware,
ChatController.sendMessage )

// router.delete('/delete', body('id').notEmpty(), validationResultMiddleware, ChatController.deleteSupportMessage)

router.get('/list', ChatController.getChatSessionList)
router.get('/:id', ChatController.getChatSession)


module.exports = router;
