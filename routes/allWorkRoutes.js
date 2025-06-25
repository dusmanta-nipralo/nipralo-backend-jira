// routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const allWorkController = require('../controllers/allWorkController');

const storage = multer.memoryStorage(); // Store file in memory as buffer
const upload = multer({ storage });
const auth = require('../middlewares/auth');
let  validAuth = require('../middlewares/authValid');

router.use(auth);
router.use(validAuth);
router.post('/upload/:id',upload.single('file'),allWorkController.uploadAttachment);


router.get('/:projectId', allWorkController.getAllWorkData);
router.get('/export/:projectId', allWorkController.exportWorkDataCSV);
router.post('/comment', allWorkController.createComment);



module.exports = router;
