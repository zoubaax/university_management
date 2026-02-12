const Certificate = require('../models/Certificate');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middlewares/async');
const { getCurrentAcademicYear } = require('../utils/academicYear');

const { query } = require('../config/db'); // Add this import

// @desc    Request a certificate
// @route   POST /api/v1/certificates/request
// @access  Private (Student)
exports.requestCertificate = asyncHandler(async (req, res, next) => {
    if (!req.user.student_id) {
        return next(new ErrorResponse('Only students can request certificates', 403));
    }

    const { type } = req.body;
    const academic_year = getCurrentAcademicYear();

    const request = await Certificate.createRequest({
        student_id: req.user.student_id,
        academic_year,
        type
    });

    // NOTIFICATION LOGIC
    try {
        const Notification = require('../models/Notification');

        // 1. Get student details (name)
        const studentResult = await query(
            `SELECT first_name, last_name, department_id FROM students WHERE id = $1`,
            [req.user.student_id]
        );
        const student = studentResult.rows[0];
        const studentName = `${student.first_name} ${student.last_name}`;

        // 2. Find recipients (Department Head/Responsible of the student's department)
        // Also notify SUPER_ADMIN just in case
        const recipientsResult = await query(`
            SELECT u.id 
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE (u.department_id = $1 AND r.name IN ('RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT'))
               OR r.name = 'SUPER_ADMIN'
        `, [student.department_id]);

        const recipientIds = recipientsResult.rows.map(r => r.id);

        // 3. Send notifications
        if (recipientIds.length > 0) {
            await Notification.notifyCertificateRequest(
                studentName,
                request.id, // passing request ID as related_id
                type,
                recipientIds
            );
        }
    } catch (error) {
        console.error('Notification error:', error);
        // Don't fail the request if notification fails
    }

    res.status(201).json({
        success: true,
        data: request
    });
});

// @desc    Get student's requests
// @route   GET /api/v1/certificates/my-requests
// @access  Private (Student)
exports.getMyRequests = asyncHandler(async (req, res, next) => {
    if (!req.user.student_id) {
        return next(new ErrorResponse('Access denied', 403));
    }

    const requests = await Certificate.findByStudent(req.user.student_id);

    res.status(200).json({
        success: true,
        data: requests
    });
});

// @desc    Get department requests
// @route   GET /api/v1/certificates/department-requests
// @access  Private (Department Head)
exports.getDepartmentRequests = asyncHandler(async (req, res, next) => {
    if (!req.user.department_id) {
        return next(new ErrorResponse('Access denied', 403));
    }

    const requests = await Certificate.findByDepartment(req.user.department_id);

    res.status(200).json({
        success: true,
        data: requests
    });
});

// @desc    Process a request
// @route   PUT /api/v1/certificates/process/:id
// @access  Private (Admin, Department Head)
exports.processRequest = asyncHandler(async (req, res, next) => {
    const { status, remarks } = req.body;

    const request = await Certificate.updateStatus(req.params.id, {
        status,
        processed_by: req.user.id,
        remarks
    });

    if (!request) {
        return next(new ErrorResponse('Request not found', 404));
    }

    // NOTIFICATION LOGIC
    try {
        const Notification = require('../models/Notification');
        const { query } = require('../config/db');

        // Get student user_id
        const studentResult = await query(
            `SELECT user_id FROM students WHERE id = $1`,
            [request.student_id]
        );
        const userId = studentResult.rows[0]?.user_id;

        if (userId) {
            let title = 'Certificate Request Update';
            let message = `Your request for ${request.type} has been ${status.toLowerCase()}`;

            if (status === 'READY') {
                title = 'Certificate Ready';
                message = `Your ${request.type} is ready for pickup!`;
            } else if (status === 'REJECTED') {
                title = 'Certificate Request Rejected';
                message = `Your request for ${request.type} was rejected. ${remarks ? 'Reason: ' + remarks : ''}`;
            }

            await Notification.create({
                user_id: userId,
                type: 'certificate',
                title: title,
                message: message,
                link: '/certificates/my-requests',
                related_id: request.id
            });
        }
    } catch (error) {
        console.error('Notification error:', error);
    }

    res.status(200).json({
        success: true,
        data: request
    });
});

// @desc    Get Full Certificate Details for generation
// @route   GET /api/v1/certificates/details/:id
// @access  Private
exports.getCertificateDetails = asyncHandler(async (req, res, next) => {
    const details = await Certificate.getFullDetails(req.params.id);

    if (!details) {
        return next(new ErrorResponse('Certificate details not found', 404));
    }

    res.status(200).json({
        success: true,
        data: details
    });
});
