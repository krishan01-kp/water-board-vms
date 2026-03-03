const express = require('express');
const bcrypt = require('bcryptjs');
const { query, run, get } = require('../database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/users (admin)
router.get('/', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });
    const users = query('SELECT id, username, role, driver_name, created_at FROM users ORDER BY created_at DESC');
    res.json(users);
});

// POST /api/users (admin)
router.post('/', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });

    const { username, password, driver_name } = req.body;
    if (!username || !password || !driver_name) {
        return res.status(400).json({ error: 'Username, password, and driver_name are required.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    try {
        const result = run(
            'INSERT INTO users (username, password, role, driver_name) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, 'user', driver_name]
        );
        const user = get('SELECT id, username, role, driver_name, created_at FROM users WHERE id = ?', [result.lastInsertRowid]);
        res.status(201).json(user);
    } catch (err) {
        if (err.message && err.message.includes('UNIQUE')) {
            return res.status(409).json({ error: 'Username already exists.' });
        }
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/users/:id (admin)
router.delete('/:id', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });

    const { id } = req.params;
    if (parseInt(id) === req.user.id) {
        return res.status(400).json({ error: 'Cannot delete your own account.' });
    }

    const user = get('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    run('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully.' });
});

module.exports = router;
