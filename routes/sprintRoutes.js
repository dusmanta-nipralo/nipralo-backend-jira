const express = require('express');
const router = express.Router();
const sprintController = require('../controllers/sprintController');
const auth = require('../middlewares/auth');
let  validAuth = require('../middlewares/authValid');

router.use(auth);
router.use(validAuth);
router.post('/', sprintController.createSprint);
router.get('/', sprintController.getAllSprints);
router.get('/:id', sprintController.getSprintById);
router.put('/:id', sprintController.updateSprint);
router.delete('/:id/soft-delete', sprintController.softDeleteSprint);
router.patch('/:id/restore', sprintController.restoreSprint);
router.get('/:id/summary', sprintController.getSprintSummary);

module.exports = router;
