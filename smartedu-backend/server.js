const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const initDb = require('./config/initDb');
const { errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const marksRoutes = require('./routes/marksRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const approvalRoutes = require('./routes/approvalRoutes');

const app = express();

// Use Render-provided PORT or fallback to 5000 for local dev
const PORT = process.env.PORT || 5000;

// CORS configuration — supports both local dev and production (Vercel)
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, Postman, Render health checks)
        if (!origin) return callback(null, true);
        // Check explicit allowed list
        if (allowedOrigins.some(o => origin.startsWith(o))) {
            return callback(null, true);
        }
        // Allow any *.onrender.com or *.vercel.app subdomain
        if (/\.onrender\.com$/.test(origin) || /\.vercel\.app$/.test(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS policy: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize DB schema on server launch
initDb();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/approvals', approvalRoutes);

// Health check endpoint — used to verify Render deployment
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'SmartEdu backend is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler for unknown routes
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Centralized error middleware (must be last)
app.use(errorHandler);

// Listen on all network interfaces (required for Docker and cloud deployment)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`SmartEdu server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
