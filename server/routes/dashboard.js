const express = require('express');
const { query, get } = require('../database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard/stats (admin)
router.get('/stats', authMiddleware, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });

    const totalVehicles = get('SELECT COUNT(*) as count FROM vehicles')?.count || 0;
    const activeBreakdowns = get("SELECT COUNT(*) as count FROM breakdowns WHERE status IN ('pending','in_progress')")?.count || 0;
    const operational = get("SELECT COUNT(*) as count FROM vehicles WHERE status = 'operational'")?.count || 0;

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
    const resolvedToday = get(
        "SELECT COUNT(*) as count FROM breakdowns WHERE status = 'resolved' AND resolved_at >= ? AND resolved_at < ?",
        [startOfDay, endOfDay]
    )?.count || 0;

    const recentBreakdowns = query('SELECT * FROM breakdowns ORDER BY created_at DESC LIMIT 10');
    const vehicles = query('SELECT * FROM vehicles ORDER BY created_at DESC');

    res.json({
        stats: { totalVehicles, activeBreakdowns, resolvedToday, operational },
        recentBreakdowns,
        vehicles
    });
});

module.exports = router;
