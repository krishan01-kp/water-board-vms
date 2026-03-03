const express = require('express');
const fs = require('fs');
const path = require('path');
const { query, run, get } = require('../database');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// GET /api/vehicles
router.get('/', authMiddleware, (req, res) => {
    const vehicles = query('SELECT * FROM vehicles ORDER BY created_at DESC');
    res.json(vehicles);
});

// POST /api/vehicles (admin, multipart)
router.post('/', authMiddleware, upload.single('photo'), (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });

    const { vehicle_type, vehicle_number, driver_name } = req.body;
    if (!vehicle_type || !vehicle_number || !driver_name) {
        return res.status(400).json({ error: 'vehicle_type, vehicle_number, and driver_name are required.' });
    }

    const photo_path = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const result = run(
            'INSERT INTO vehicles (vehicle_type, vehicle_number, driver_name, photo_path, status) VALUES (?, ?, ?, ?, ?)',
            [vehicle_type, vehicle_number, driver_name, photo_path, 'operational']
        );
        const vehicle = get('SELECT * FROM vehicles WHERE id = ?', [result.lastInsertRowid]);
        res.status(201).json(vehicle);
    } catch (err) {
        if (err.message && err.message.includes('UNIQUE')) {
            return res.status(409).json({ error: 'Vehicle number already exists.' });
        }
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/vehicles/:id (admin)
router.put('/:id', authMiddleware, upload.single('photo'), (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });

    const { id } = req.params;
    const vehicle = get('SELECT * FROM vehicles WHERE id = ?', [id]);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found.' });

    const vehicle_type = req.body.vehicle_type || vehicle.vehicle_type;
    const vehicle_number = req.body.vehicle_number || vehicle.vehicle_number;
    const driver_name = req.body.driver_name || vehicle.driver_name;
    const status = req.body.status || vehicle.status;
    let photo_path = vehicle.photo_path;

    if (req.file) {
        if (vehicle.photo_path) {
            const oldPath = path.join(__dirname, '..', vehicle.photo_path);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        photo_path = `/uploads/${req.file.filename}`;
    }

    run('UPDATE vehicles SET vehicle_type=?, vehicle_number=?, driver_name=?, photo_path=?, status=? WHERE id=?',
        [vehicle_type, vehicle_number, driver_name, photo_path, status, id]);

    const updated = get('SELECT * FROM vehicles WHERE id = ?', [id]);
    res.json(updated);
});

// DELETE /api/vehicles/:id (admin)
router.delete('/:id', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });

    const { id } = req.params;
    const vehicle = get('SELECT * FROM vehicles WHERE id = ?', [id]);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found.' });

    if (vehicle.photo_path) {
        const photoPath = path.join(__dirname, '..', vehicle.photo_path);
        if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
    }

    run('DELETE FROM vehicles WHERE id = ?', [id]);
    res.json({ message: 'Vehicle deleted successfully.' });
});

module.exports = router;
