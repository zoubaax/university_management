const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const xss = require('xss-clean');
const errorHandler = require('./middlewares/error');
const logger = require('./utils/logger');

// Load env vars
dotenv.config();

const app = express();

// Body parser
app.use(express.json());

// Prevent HTTP parameter pollution
app.use(hpp());

// Prevent XSS attacks
app.use(xss());

// Request logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    next();
});

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Set security headers
app.use(helmet());

// Enable CORS
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Route files
const auth = require('./routes/auth');
const departments = require('./routes/department');
const specialities = require('./routes/speciality');
const employees = require('./routes/employee');
const students = require('./routes/student');

// Mount routes
app.use('/api/v1/auth', auth);
app.use('/api/v1/departments', departments);
app.use('/api/v1/specialities', specialities);
app.use('/api/v1/employees', employees);
app.use('/api/v1/students', students);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Server is healthy' });
});

// Error handler
app.use(errorHandler);

module.exports = app;
