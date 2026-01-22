require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const sisterhoodRoutes = require('./routes/sisterhood');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3002;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://as12711.github.io'] 
        : ['http://localhost:3000', 'http://localhost:19006', 'http://localhost:8081', 'http://127.0.0.1:5500', 'http://localhost:5500', 'null', '*'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (admin.html) from parent directory
const path = require('path');
app.use(express.static(path.join(__dirname, '..')));

// Routes
// Public authentication routes
app.use('/api/auth', authRoutes);

// Sisterhood routes (signup endpoint is rate-limited within the route file)
app.use('/api/sisterhood', sisterhoodRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        service: 'Sisterhood Initiative API',
        timestamp: new Date().toISOString() 
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'Man Up! Inc. Sisterhood Initiative API',
        version: '1.0.0',
        endpoints: {
            health: 'GET /health',
            signup: 'POST /api/sisterhood/signup',
            signups: 'GET /api/sisterhood/signups'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(err.status || 500).json({ 
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 Sisterhood Initiative Backend                         ║
║   ══════════════════════════════════════════════════════   ║
║                                                            ║
║   Server running on port ${PORT}                             ║
║   Health check: http://localhost:${PORT}/health              ║
║                                                            ║
║   Man Up! Inc. - Empowering Women                          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
