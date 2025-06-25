let express = require('express')
let router = express.Router();
let settingController = require('../controllers/settingsController')
const auth = require('../middlewares/auth');
let  validAuth = require('../middlewares/authValid');

router.use(auth);
router.use(validAuth);
router.post('/',settingController.createSetting)
router.put('/:id',settingController.updateSetting);
router.get('/',settingController.getSettings)
router.get('/:id',settingController.getSettingsById)
router.delete('/:id/delete',settingController.softDeleteSetting)
router.patch('/:id/restore',settingController.restoreSetting)

module.exports = router;