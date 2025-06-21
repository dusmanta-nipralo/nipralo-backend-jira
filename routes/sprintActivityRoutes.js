const express = require('express');
const router = express.Router();
const controller = require('../controllers/sprintActivityController');

// Start/stop sprint using backlogId
router.post('/start-by-backlog/:backlogId', controller.startSprintByBacklog);
router.post('/stop-by-backlog/:backlogId', controller.stopSprintByBacklog);

// Start/stop sprint using sprintId
router.post('/start-by-sprint/:sprintId', controller.startSprintBySprintId);
router.post('/stop-by-sprint/:sprintId', controller.stopSprintBySprintId);


module.exports = router;
