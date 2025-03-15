const bcrypt = require('bcrypt');
const { query } = require('../services/db');

exports.adminLoginPage = (req, res) => {
    res.render('adminLogin', { title: 'Admin Login' });
};

exports.userLoginPage = (req, res) => {
    res.render('userLogin', { title: 'User Login' });
};

exports.adminLogin = async (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM Users WHERE username = ? AND role = "admin"';

    try {
        const users = await query(sql, [username]);
        const user = users[0];

        if (!user) return res.status(404).json({ error: 'Admin not found' });

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        req.session.user = user;
        res.redirect('/admin/dashboard');
    } catch (error) {
        res.status(500).json({ error: 'Admin login failed' });
    }
};

exports.userLogin = async (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM Users WHERE username = ? AND role = "library_user"';

    try {
        const users = await query(sql, [username]);
        const user = users[0];

        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        req.session.user = user;
        res.redirect('/books');
    } catch (error) {
        res.status(500).json({ error: 'User login failed' });
    }
};