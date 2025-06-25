const express = require('express');
const router = express.Router();
const backlogController = require('../controllers/backlogController');
const auth = require('../middlewares/auth');
let  validAuth = require('../middlewares/authValid');

router.use(auth);
router.use(validAuth);

router.post('/', backlogController.createBacklog);

router.get('/', backlogController.getAllBacklogs);

router.get('/:id', backlogController.getBacklogById);

router.get('/sprint/:sprintId', backlogController.getBacklogsBySprint);

router.put('/:id', backlogController.updateBacklog);

router.delete('/:id/soft-delete', backlogController.softDeleteBacklog);

router.patch('/:id/restore', backlogController.restoreBacklog);

module.exports = router;
