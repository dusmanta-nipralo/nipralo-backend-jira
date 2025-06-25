const express = require('express');
const router = express.Router();
const timeEntryController = require('../controllers/timeTrackingController');
const auth = require('../middlewares/auth');
let  validAuth = require('../middlewares/authValid');

router.use(auth);
router.use(validAuth);

router.get('/team',timeEntryController.getTimeTrackingTeamView);
router.get('/time', timeEntryController.getTimeTrackingTimeView);
router.get('/team/export', timeEntryController.exportTeamViewCSV);
router.get('/time/export', timeEntryController.exportTimeViewCSV);


module.exports = router;