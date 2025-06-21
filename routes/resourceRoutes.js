const express = require('express');
const router = express.Router();
const clientController = require('../controllers/resourceController');
const auth = require('../middlewares/auth');
let  validAuth = require('../middlewares/authValid');

router.use(auth);
router.use(validAuth);

// Resource CRUD
router.post('/:clientId/resources', clientController.createResource);
router.get('/:clientId/resources', clientController.getResources);
router.get('/:clientId/resources/:id', clientController.getResourceById);
router.put('/:id', clientController.updateResource);
router.delete('/:id/delete', clientController.softDeleteResource);
router.patch('/:id/restore', clientController.restoreResource);

router.get('/', clientController.getResources);
router.get('/:id', clientController.getResourceById);
module.exports = router;