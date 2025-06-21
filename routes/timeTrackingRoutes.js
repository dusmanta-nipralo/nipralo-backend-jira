const express = require('express');
const router = express.Router();
const timeEntryController = require('../controllers/timeTrackingController');
const auth = require('../middlewares/auth');
let  validAuth = require('../middlewares/authValid');

router.use(auth);
router.use(validAuth);

router.post('/timeEntry',timeEntryController.addTimeEntry);
router.get('/time-summary', timeEntryController.getTimeSummary);
router.get('/time-summary/export', timeEntryController.exportTimeSummaryCSV);

module.exports = router;