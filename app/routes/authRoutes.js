const express = require('express');
const router = express.Router();
const authController = require('./controllers/authController');

// Admin routes
router.get('/admin-login', authController.adminLogin);
router.post('/admin-login', authController.adminLogin);


// Registration route
router.get('/register', authController.register);
router.post('/register', authController.register);


// User routes
router.get('/login', authController.userLogin);
router.post('/login', authController.userLogin);


// Logout route
router.get('/logout', authController.logout);

module.exports = router;