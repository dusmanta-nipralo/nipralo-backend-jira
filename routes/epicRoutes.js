const express = require('express');
const router = express.Router();
const epicController = require('../controllers/epicController');
const auth = require('../middlewares/auth');
let  validAuth = require('../middlewares/authValid');

router.use(auth);
router.use(validAuth);
router.post('/', epicController.createEpic);

router.get('/', epicController.getAllEpics);

router.get('/:id', epicController.getEpicById);

//router.get('/project/:projectId', epicController.getEpicsByProject);

router.put('/:id', epicController.updateEpic);

router.delete('/:id/soft-delete', epicController.softDeleteEpic);

router.patch('/:id/restore', epicController.restoreEpic);

module.exports = router;
