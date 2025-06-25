const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middlewares/auth');
let  validAuth = require('../middlewares/authValid');

router.use(auth);
router.use(validAuth);

router.post('/', projectController.createProject);
router.get('/', projectController.getProjects);
router.get('/starred', projectController.getStarredProjects);
router.get('/:id', projectController.getProjectById);
router.put('/:id', projectController.updateProject);
router.patch('/:id/star', projectController.toggleStarred);
router.delete('/:id/delete', projectController.softDeleteProject);
router.patch('/:id/restore', projectController.restoreProject);
router.get('/progress/:projectId', projectController.getProjectProgress);



module.exports = router;
