const Grade = require('../models/Grade');
const ErrorResponse = require('../utils/ErrorResponse');
const asyncHandler = require('../middlewares/async');
const { getCurrentAcademicYear } = require('../utils/academicYear');

// @desc    Get grades for a specific class and module
// @route   GET /api/grades/class/:classId/module/:moduleId
// @access  Private (Professor, Admin)
exports.getClassGrades = asyncHandler(async (req, res, next) => {
    const { classId, moduleId } = req.params;
    const academicYear = req.query.academicYear || getCurrentAcademicYear();

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
    const notificationPayloads = []; // Store data for notifications

    for (const gradeData of grades) {
        // Add current professor_id if not provided
        if (req.user.role_name === 'PROFESSOR') {
            gradeData.professor_id = req.user.employee_id;
        }

        const grade = await Grade.upsert(gradeData);
        results.push(grade);

        // Track unique student+module combinations to avoid duplicate notifications in same batch
        const key = `${gradeData.student_id}-${gradeData.module_id}`;
        if (!notificationPayloads.some(n => `${n.student_id}-${n.module_id}` === key)) {
            notificationPayloads.push({
                student_id: gradeData.student_id,
                module_id: gradeData.module_id,
                type: gradeData.type
            });
        }
    }

    // NOTIFICATION LOGIC
    try {
        const Notification = require('../models/Notification');
        const { query } = require('../config/db');

        // 1. Get module names map
        const uniqueModuleIds = [...new Set(notificationPayloads.map(p => p.module_id))];
        const moduleNames = {};

        if (uniqueModuleIds.length > 0) {
            const modResult = await query('SELECT id, name FROM modules WHERE id = ANY($1)', [uniqueModuleIds]);
            modResult.rows.forEach(r => moduleNames[r.id] = r.name);
        }

        // 2. Get User IDs for students map
        const uniqueStudentIds = [...new Set(notificationPayloads.map(p => p.student_id))];
        const studentUserMap = {};

        if (uniqueStudentIds.length > 0) {
            const userResult = await query('SELECT id, user_id FROM students WHERE id = ANY($1)', [uniqueStudentIds]);
            userResult.rows.forEach(r => studentUserMap[r.id] = r.user_id);
        }

        // 3. Send notifications
        const notificationPromises = notificationPayloads.map(payload => {
            const userId = studentUserMap[payload.student_id];
            const moduleName = moduleNames[payload.module_id] || 'Course';

            if (userId) {
                return Notification.notifyGradePosted(
                    moduleName,
                    payload.type,
                    userId
                );
            }
            return Promise.resolve();
        });

        await Promise.allSettled(notificationPromises);

    } catch (error) {
        console.error('Notification error:', error);
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
    const academicYear = req.query.academicYear || getCurrentAcademicYear();

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
