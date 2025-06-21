const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const auth = require('../middlewares/auth');
let  validAuth = require('../middlewares/authValid');

router.use(auth);
router.use(validAuth);
// Client CRUD
router.post('/', clientController.createClient);
router.get('/', clientController.getClients);
router.get('/:id', clientController.getClientById);
router.put('/:id', clientController.updateClient);
router.delete('/:id/delete', clientController.softDeleteClient);  // Soft delete
router.patch('/:id/restore', clientController.restoreClient);  

module.exports = router;
