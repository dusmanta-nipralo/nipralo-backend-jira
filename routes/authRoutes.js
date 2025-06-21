const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');
let  validAuth = require('../middlewares/authValid');

// Register new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get current user (protected route)
router.get('/me', auth,validAuth, authController.getCurrentUser);

module.exports = router;
