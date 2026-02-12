const Certificate = require('../models/Certificate');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');
const { getCurrentAcademicYear } = require('../utils/academicYear');

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
