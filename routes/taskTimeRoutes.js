let express = require('express')
let router = express.Router();
let controller = require('../controllers/taskTimeController')
let auth = require('../middlewares/auth')
let validAuth = require('../middlewares/authValid')

router.use(auth)
router.use(validAuth)

router.post('/',controller.createTaskTime)

router.get('/',controller.getTaskTime)

router.get('/:id',controller.getTaskTimeById)

router.put('/:id',controller.updateTaskTime)

router.delete('/:id/delete',controller.softDelete)

router.patch('/:id/restore',controller.restore)

router.get('/filter',controller.filterTaskTime)

module.exports = router