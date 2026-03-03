const express = require('express');
const XLSX = require('xlsx');
const { query, run, get } = require('../database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${mins}`;
}

// GET /api/breakdowns/export - must be before /:id
router.get('/export', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });

    const breakdowns = query('SELECT * FROM breakdowns ORDER BY created_at DESC');

    const data = breakdowns.map((b, i) => ({
        '#': i + 1,
        'Date': formatDate(b.created_at),
        'Vehicle No': b.vehicle_number,
        'Vehicle Type': b.vehicle_type,
        'Location': b.location,
        'Comment': b.comment || '',
        'Reported By': b.reported_by,
        'Status': b.status,
        'Resolved At': b.resolved_at ? formatDate(b.resolved_at) : ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Breakdown Reports');
    ws['!cols'] = [{ wch: 5 }, { wch: 18 }, { wch: 12 }, { wch: 16 }, { wch: 25 }, { wch: 30 }, { wch: 15 }, { wch: 12 }, { wch: 18 }];

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    res.setHeader('Content-Disposition', 'attachment; filename="breakdown_reports.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
});

// GET /api/breakdowns
router.get('/', authMiddleware, (req, res) => {
    let breakdowns;
    if (req.user.role === 'admin') {
        breakdowns = query('SELECT * FROM breakdowns ORDER BY created_at DESC');
    } else {
        breakdowns = query('SELECT * FROM breakdowns WHERE reported_by = ? ORDER BY created_at DESC', [req.user.username]);
    }
    res.json(breakdowns);
});

// POST /api/breakdowns
router.post('/', authMiddleware, (req, res) => {
    const { vehicle_id, vehicle_number, vehicle_type, location, comment } = req.body;

    if (!vehicle_number || !vehicle_type || !location) {
        return res.status(400).json({ error: 'vehicle_number, vehicle_type, and location are required.' });
    }

    const result = run(
        'INSERT INTO breakdowns (vehicle_id, vehicle_number, vehicle_type, location, comment, reported_by, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [vehicle_id || null, vehicle_number, vehicle_type, location, comment || '', req.user.username, 'pending']
    );

    if (vehicle_id) {
        run("UPDATE vehicles SET status = 'breakdown' WHERE id = ?", [vehicle_id]);
    }

    const breakdown = get('SELECT * FROM breakdowns WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json(breakdown);
});

// PUT /api/breakdowns/:id (admin)
router.put('/:id', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });

    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'in_progress', 'resolved'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status.' });
    }

    const breakdown = get('SELECT * FROM breakdowns WHERE id = ?', [id]);
    if (!breakdown) return res.status(404).json({ error: 'Breakdown not found.' });

    const resolved_at = status === 'resolved' ? new Date().toISOString() : null;
    run('UPDATE breakdowns SET status = ?, resolved_at = ? WHERE id = ?', [status, resolved_at, id]);

    if (status === 'resolved' && breakdown.vehicle_id) {
        run("UPDATE vehicles SET status = 'operational' WHERE id = ?", [breakdown.vehicle_id]);
    } else if (status === 'in_progress' && breakdown.vehicle_id) {
        run("UPDATE vehicles SET status = 'under_repair' WHERE id = ?", [breakdown.vehicle_id]);
    }

    const updated = get('SELECT * FROM breakdowns WHERE id = ?', [id]);
    res.json(updated);
});

module.exports = router;
