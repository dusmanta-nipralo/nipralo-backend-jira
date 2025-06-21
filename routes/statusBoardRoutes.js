const express = require('express');
const router = express.Router();
const statusColumnController = require('../controllers/statusBoardController');

// Create
router.post('/', statusColumnController.createStatusColumn);

// Get all for board
router.get('/board', statusColumnController.getColumnsByBoard);

// Get all active columns (new route)
router.get('/', statusColumnController.getAllColumns);

// Update column
router.put('/:id', statusColumnController.updateStatusColumn);

// Soft delete
router.delete('/delete/:id', statusColumnController.softDeleteColumn);

// Restore
router.patch('/restore/:id', statusColumnController.restoreColumn);

module.exports = router;
