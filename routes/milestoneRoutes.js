const express = require('express');
const router = express.Router();
const milestoneController = require('../controllers/milestoneController');
const auth = require('../middlewares/auth');
let  validAuth = require('../middlewares/authValid');

router.use(auth);
router.use(validAuth);
// Create milestone for a project
router.post('/', milestoneController.createMilestone);

// Get all milestones by project ID
router.get('/project/:projectId', milestoneController.getMilestonesByProject);

// Get a specific milestone
router.get('/:id', milestoneController.getMilestoneById);

// Update a milestone
router.put('/:id', milestoneController.updateMilestone);

// Soft delete
router.delete('/:id/soft-delete', milestoneController.softDeleteMilestone);

// Restore
router.patch('/:id/restore', milestoneController.restoreMilestone);

module.exports = router;
