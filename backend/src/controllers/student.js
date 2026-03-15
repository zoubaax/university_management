const StudentService = require('../services/studentService');

// @desc    Get all students
// @route   GET /api/v1/students
// @access  Private
exports.getStudents = async (req, res, next) => {
    try {
        const students = await StudentService.getAllStudents(req.user);
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
        const student = await StudentService.getStudentById(req.params.id, req.user);
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
        const studentData = { ...req.body };
        const userData = {
            email: req.body.email,
            password: req.body.password,
            role_id: req.body.role_id
        };

        // Handle file uploads
        if (req.files) {
            if (req.files.bac_document) {
                studentData.bac_document_url = req.files.bac_document[0].path;
            }
            if (req.files.cin_document) {
                studentData.cin_document_url = req.files.cin_document[0].path;
            }
        }

        const student = await StudentService.createStudent(studentData, userData, req.user);
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
        const studentData = { ...req.body };

        // Handle file uploads
        if (req.files) {
            if (req.files.bac_document) {
                studentData.bac_document_url = req.files.bac_document[0].path;
            }
            if (req.files.cin_document) {
                studentData.cin_document_url = req.files.cin_document[0].path;
            }
        }

        const student = await StudentService.updateStudent(req.params.id, studentData, req.user);
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
        await StudentService.deleteStudent(req.params.id, req.user);
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
