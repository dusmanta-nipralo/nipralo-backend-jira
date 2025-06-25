const express = require('express');
const router = express.Router();
const controller = require('../controllers/sprintActivityController');
const auth = require('../middlewares/auth');
let  validAuth = require('../middlewares/authValid');

router.use(auth);
router.use(validAuth);
// Start/stop sprint using backlogId
router.post('/start-by-backlog/:backlogId', controller.startSprintByBacklog);
router.post('/stop-by-backlog/:backlogId', controller.stopSprintByBacklog);

// Start/stop sprint using sprintId
router.post('/start-by-sprint/:sprintId', controller.startSprintBySprintId);
router.post('/stop-by-sprint/:sprintId', controller.stopSprintBySprintId);

router.post('/completed/:sprintId',controller.completeSprint);


module.exports = router;
