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
router.put('/:clientId/resources/:id', clientController.updateResource);
router.delete('/:clientId/resources/:id', clientController.softDeleteResource);
router.patch('/:clientId/resources/:id', clientController.restoreResource);


module.exports = router;