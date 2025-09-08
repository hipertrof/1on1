const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for transcript uploads

// Request logging middleware - BEFORE static files
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

app.use(express.static(path.join(__dirname, '../frontend')));

// API routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Serve frontend for all non-API routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Catch-all for other routes (SPA routing)
app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 1-on-1 Manager Server running on http://localhost:${PORT}`);
    console.log(`📊 Database: ${process.env.KV_REST_API_URL ? 'Vercel KV' : 'Local fallback'}`);
});