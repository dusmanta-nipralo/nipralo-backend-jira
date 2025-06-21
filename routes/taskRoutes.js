const express = require('express');
const router = express.Router();
const controller = require('../controllers/taskController');

router.post('/', controller.createTask);
router.get('/filter',controller.filterTask);
router.get('/', controller.getAllTasks);
router.get('/:id', controller.getTaskById);
router.put('/:id', controller.updateTask);
router.delete('/:id', controller.deleteTask);
router.patch('/restore/:id', controller.restoreTask);



module.exports = router;
