const bcrypt = require('bcrypt');
const { query } = require('../services/db');
const rateLimit = require('express-rate-limit'); // For rate limiting
const logger = require('../utils/logger'); // Custom logger for logging errors

// Rate limiter for login endpoints to prevent brute-force attacks
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per windowMs
    message: 'Too many login attempts, please try again after 15 minutes',
});

exports.adminLoginPage = (req, res) => {
    res.render('adminLogin', { title: 'Admin Login' });
};

exports.userLoginPage = (req, res) => {
    res.render('userLogin', { title: 'User Login' });
};

exports.registerPage = (req, res) => {
    res.render('register', { title: 'Register' });
};

exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO Users (username, password_hash, email, role) VALUES (?, ?, ?, ?)';

    try {
        await query(sql, [username, hashedPassword, email, 'library_user']);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to register user' });
    }
};


// Admin Login Logic
exports.adminLogin = [loginLimiter, async (req, res) => {
    const { username, password } = req.body;

    // Input validation
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const sql = 'SELECT * FROM Users WHERE username = ? AND role = "admin"';

    try {
        const users = await query(sql, [username]);
        const user = users[0];

        // Check if admin user exists
        if (!user) {
            logger.warn(`Admin login attempt failed: Admin not found for username ${username}`);
            return res.status(404).json({ error: 'Admin not found' });
        }

        // Compare provided password with hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            logger.warn(`Admin login attempt failed: Invalid credentials for username ${username}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Set session with user data and expiry
        req.session.user = user;
        req.session.cookie.expires = new Date(Date.now() + 60 * 60 * 1000); // 1-hour session expiry
        req.session.cookie.secure = true; // Ensure cookies are only sent over HTTPS

        logger.info(`Admin login successful for username ${username}`);
        res.redirect('/admin/dashboard');
    } catch (error) {
        logger.error(`Admin login failed: ${error.message}`);
        res.status(500).json({ error: 'Admin login failed' });
    }
}];

// User Login Logic
exports.userLogin = [loginLimiter, async (req, res) => {
    const { username, password } = req.body;

    // Input validation
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const sql = 'SELECT * FROM Users WHERE username = ? AND role = "library_user"';

    try {
        const users = await query(sql, [username]);
        const user = users[0];

        // Check if user exists
        if (!user) {
            logger.warn(`User login attempt failed: User not found for username ${username}`);
            return res.status(404).json({ error: 'User not found' });
        }

        // Compare provided password with hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            logger.warn(`User login attempt failed: Invalid credentials for username ${username}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Set session with user data and expiry
        req.session.user = user;
        req.session.cookie.expires = new Date(Date.now() + 60 * 60 * 1000); // 1-hour session expiry
        req.session.cookie.secure = false; // Ensure cookies are only sent over HTTPS

        logger.info(`User login successful for username ${username}`);
        res.redirect('/dashboard');
    } catch (error) {
        logger.error(`User login failed: ${error.message}`);
        res.status(500).json({ error: 'User login failed' });
    }
}];