const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { get } = require('../database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'wbvms_secret_key_2024';

// POST /api/auth/login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    const user = get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role, driver_name: user.driver_name },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.json({
        token,
        user: {
            id: user.id,
            username: user.username,
            role: user.role,
            driver_name: user.driver_name
        }
    });
});

module.exports = router;
