const router = require('express').Router();
const ProfileController = require('../controllers/profileController');
const {body, param} = require('express-validator');
const validationResultMiddleware = require('../middlewares/validationResultMiddleware');  

/** uses auth middleware **/

router.get('/', ProfileController.getCompanyProfile);


// step 1
router.post('/submit-web-url', 
body('webUrl').notEmpty().withMessage("webUrl field is required"), 
validationResultMiddleware,
ProfileController.submitWebUrlAndScrapeData )

// step 2, 3
router.post('/save', ProfileController.submitCompanyDetails)

// after completing profile
router.post('/mark-as-complete', ProfileController.markProfileAsComplete)

module.exports = router;
