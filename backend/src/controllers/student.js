const StudentService = require('../services/studentService');

// @desc    Get all students
// @route   GET /api/v1/students
// @access  Private
exports.getStudents = async (req, res, next) => {
    try {
        const students = await StudentService.getAllStudents();
        res.status(200).json({ success: true, count: students.length, data: students });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single student
// @route   GET /api/v1/students/:id
// @access  Private
exports.getStudent = async (req, res, next) => {
    try {
        const student = await StudentService.getStudentById(req.params.id);
        res.status(200).json({ success: true, data: student });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new student
// @route   POST /api/v1/students
// @access  Private/Admin
exports.createStudent = async (req, res, next) => {
    try {
        const { email, password, role_id, ...studentData } = req.body;
        const student = await StudentService.createStudent(studentData, { email, password, role_id });
        res.status(201).json({ success: true, data: student });
    } catch (err) {
        next(err);
    }
};

// @desc    Update student
// @route   PUT /api/v1/students/:id
// @access  Private/Admin
exports.updateStudent = async (req, res, next) => {
    try {
        const student = await StudentService.updateStudent(req.params.id, req.body);
        res.status(200).json({ success: true, data: student });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete student
// @route   DELETE /api/v1/students/:id
// @access  Private/Admin
exports.deleteStudent = async (req, res, next) => {
    try {
        await StudentService.deleteStudent(req.params.id);
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
