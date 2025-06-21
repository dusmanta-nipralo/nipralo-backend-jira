const express = require('express');
const router = express.Router();
const backlogController = require('../controllers/backlogController');

router.post('/', backlogController.createBacklog);

router.get('/', backlogController.getAllBacklogs);

router.get('/:id', backlogController.getBacklogById);

router.get('/sprint/:sprintId', backlogController.getBacklogsBySprint);

router.put('/:id', backlogController.updateBacklog);

router.delete('/:id/soft-delete', backlogController.softDeleteBacklog);

router.patch('/:id/restore', backlogController.restoreBacklog);

module.exports = router;
