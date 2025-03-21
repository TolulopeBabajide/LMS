const express = require('express');
const authController = require('../controllers/authController');
const { validateRegistration } = require('../middlewares/validationMiddleware');
// const { ensureAuthenticated, ensureUser } = require('../middlewares/authMiddleware');

const router = express.Router();

// Login routes
router.get('/login', authController.userLoginPage);
router.post('/login', authController.userLogin);

// Registration routes
router.get('/register', authController.registerPage);
router.post('/register', validateRegistration, authController.register);

// Logout route
router.get('/logout', authController.logout);

module.exports = router;