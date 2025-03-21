const express = require('express');
const router = express.Router();
const authController = require('./controllers/authController');

// Admin routes
router.get('/admin-login', authController.adminLoginPage);
router.post('/admin-login', authController.adminLogin);


// Registration route
router.get('/register', authController.registerPage);
router.post('/register', authController.register);


// User routes
router.get('/login', authController.userLoginPage);
router.post('/login', authController.userLogin);


// Logout route
router.get('/logout', authController.logout);

module.exports = router;