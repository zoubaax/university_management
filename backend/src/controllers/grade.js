const Grade = require('../models/Grade');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middlewares/async');

// @desc    Get grades for a specific class and module
// @route   GET /api/grades/class/:classId/module/:moduleId
// @access  Private (Professor, Admin)
exports.getClassGrades = asyncHandler(async (req, res, next) => {
    const { classId, moduleId } = req.params;
    const academicYear = req.query.academicYear || '2023/2024'; // Default to current system year

    const grades = await Grade.findByClassAndModule(classId, moduleId, academicYear);

    res.status(200).json({
        success: true,
        data: grades
    });
});

// @desc    Update or create grades for students
// @route   POST /api/grades/upsert-bulk
// @access  Private (Professor, Admin)
exports.upsertGrades = asyncHandler(async (req, res, next) => {
    const { grades } = req.body; // Expecting array of grade objects

    if (!Array.isArray(grades) || grades.length === 0) {
        return next(new ErrorResponse('Please provide grades to update', 400));
    }

    const results = [];
    for (const gradeData of grades) {
        // Add current professor_id if not provided
        if (req.user.role_name === 'PROFESSOR') {
            gradeData.professor_id = req.user.employee_id;
        }

        const grade = await Grade.upsert(gradeData);
        results.push(grade);
    }

    res.status(200).json({
        success: true,
        data: results
    });
});

// @desc    Get my grades (Student view)
// @route   GET /api/grades/my-grades
// @access  Private (Student)
exports.getMyGrades = asyncHandler(async (req, res, next) => {
    const academicYear = req.query.academicYear || '2023/2024';

    // Check if user is student
    if (!req.user.student_id) {
        return next(new ErrorResponse('Only students can access their personal grades', 403));
    }

    const grades = await Grade.findByStudent(req.user.student_id, academicYear);

    res.status(200).json({
        success: true,
        data: grades
    });
});
