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
const uploadDir = process.env.DATA_DIR ? path.join(process.env.DATA_DIR, 'uploads') : path.join(__dirname, 'uploads');
const fs = require('fs');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

let dbStatus = 'initializing';
let dbError = null;

// Health check (always available)
app.get('/api/health', (req, res) => {
    res.json({ status: dbStatus, message: 'Water Board VMS API', error: dbError });
});

// Always bind to port first, so Railway doesn't timeout the container
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server listening on port ${PORT}`);

    // Initialize DB after listening
    initDb().then(() => {
        dbStatus = 'ok';
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
        console.log('✅ All routes mounted and ready.');
    }).catch(err => {
        dbStatus = 'failed';
        dbError = err.message || String(err);
        console.error('❌ Failed to initialize database:', err);
    });
});
