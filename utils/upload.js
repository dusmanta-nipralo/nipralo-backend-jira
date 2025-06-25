// utils/upload.js
const multer = require('multer');

const storage = multer.memoryStorage(); // stores file in memory for buffer upload
const upload = multer({ storage });

module.exports = upload;
