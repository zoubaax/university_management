const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const errorHandler = require('./middlewares/error');
const logger = require('./utils/logger');
const path = require('path');

// Load env vars
dotenv.config();

const app = express();

// Serve static files
// Serve from root for /uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
// Serve from /api/v1/uploads for compatibility
app.use('/api/v1/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Diagnostic log
console.log('Backend starting...');
console.log('Configured CLIENT_URL:', process.env.CLIENT_URL || 'http://localhost:5173');

// 1. Enable CORS - MUST BE FIRST to handle preflights
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
// app.use(cors(corsOptions)) handles preflight OPTIONS requests automatically

// 2. Set security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false
}));

// 3. Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Cookie parser
app.use(cookieParser());

// 5. Prevent HTTP parameter pollution
app.use(hpp());

// 7. Request logging (Custom)
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    next();
});

// 8. Dev logging (Morgan)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// 9. Rate limiting (Disabled)
// const limiter = rateLimit({
//     windowMs: 10 * 60 * 1000, 
//     max: 5000 
// });
// app.use('/api', limiter);

// 10. Route files
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
app.use('/api/v1/absences', require('./routes/absence'));
app.use('/api/v1/classes', require('./routes/class'));
app.use('/api/v1/roles', require('./routes/role'));
app.use('/api/v1/modules', require('./routes/module'));
app.use('/api/v1/schedules', require('./routes/schedule'));
app.use('/api/v1/rooms', require('./routes/room'));
app.use('/api/v1/student-attendance', require('./routes/studentAttendance'));
app.use('/api/v1/course-resources', require('./routes/courseResource'));
app.use('/api/v1/grades', require('./routes/grade'));
app.use('/api/v1/certificates', require('./routes/certificate'));
app.use('/api/v1/messages', require('./routes/messages'));
app.use('/api/v1/dashboard', require('./routes/dashboard'));
app.use('/api/v1/notifications', require('./routes/notifications'));

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Server is healthy' });
});

// 11. Error handler
app.use(errorHandler);

module.exports = app;
