const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded vehicle photos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check (before DB init)
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Water Board VMS API running' });
});

// Initialize DB then mount routes
initDb().then(() => {
    const authRoutes = require('./routes/auth');
    const vehicleRoutes = require('./routes/vehicles');
    const userRoutes = require('./routes/users');
    const breakdownRoutes = require('./routes/breakdowns');
    const dashboardRoutes = require('./routes/dashboard');

    app.use('/api/auth', authRoutes);
    app.use('/api/vehicles', vehicleRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/breakdowns', breakdownRoutes);
    app.use('/api/dashboard', dashboardRoutes);

    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('❌ Failed to initialize database:', err);
    process.exit(1);
});
