const express = require('express');
const router = express.Router();
const authController = require('./controllers/authController');

// Admin routes
router.get('/admin-login', authController.adminLoginPage);
router.post('/admin-login', authController.adminLogin);

// User routes
router.get('/user-login', authController.userLoginPage);
router.post('/user-login', authController.userLogin);

// Registration route
router.get('/register', authController.registerPage);
router.post('/register', authController.register);

module.exports = router;