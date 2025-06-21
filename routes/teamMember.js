const express = require('express');
const router = express.Router();
const teamMemberController = require('../controllers/teamMemberController');
const auth = require('../middlewares/auth');
let  validAuth = require('../middlewares/authValid');

router.use(auth);
router.use(validAuth);
// Create a new team member
router.post('/', teamMemberController.createTeamMember);

// Get all active team members by projectId
router.get('/:projectId', teamMemberController.getTeamMembers);

// Get a single team member by member ID
router.get('/member/:id', teamMemberController.getTeamMemberById);

// Update a team member (name, email, role)
router.put('/update/:id', teamMemberController.updateTeamMember);

// Soft delete a team member
router.delete('/delete/:id', teamMemberController.softDeleteTeamMember);

// Restore a soft-deleted team member
router.patch('/restore/:id', teamMemberController.restoreTeamMember);

module.exports = router;
