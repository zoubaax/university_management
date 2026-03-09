const StudentAttendance = require('../models/StudentAttendance');
const Student = require('../models/Student');
const Schedule = require('../models/Schedule');
const Class = require('../models/Class');

// @desc    Get attendance for a specific session
// @route   GET /api/v1/student-attendance/session/:scheduleId?date=YYYY-MM-DD
exports.getSessionAttendance = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ success: false, error: 'Please provide a date' });
        }

        // 1. Get schedule to know the class
        const schedule = await Schedule.findById(scheduleId);
        if (!schedule) {
            return res.status(404).json({ success: false, error: 'Schedule not found' });
        }

        // 2. Get all students in the class
        const students = await Student.findByClass(schedule.class_id);

        // 3. Get existing attendance records
        const attendanceRecords = await StudentAttendance.findAllBySession(scheduleId, date);

        // 4. Merge students with attendance status
        const studentsWithStatus = students.map(student => {
            const record = attendanceRecords.find(r => r.student_id === student.id);
            return {
                ...student,
                status: record ? record.status : 'PRESENT', // Default to present if no record
                remarks: record ? record.remarks : '',
                attendance_id: record ? record.id : null
            };
        });

        res.status(200).json({
            success: true,
            count: studentsWithStatus.length,
            data: {
                schedule,
                students: studentsWithStatus
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Record or update attendance for a session
// @route   POST /api/v1/student-attendance/session/:scheduleId
exports.recordSessionAttendance = async (req, res) => {
    try {
        const { scheduleId } = req.params;
        const { date, students } = req.body; // students is an array of { student_id, status, remarks }

        if (!date || !students || !Array.isArray(students)) {
            return res.status(400).json({ success: false, error: 'Please provide date and students array' });
        }

        const professor_id = req.user.employee_id; // recorded_by professor

        const attendances = students.map(s => ({
            student_id: s.student_id,
            schedule_id: scheduleId,
            date,
            status: s.status,
            remarks: s.remarks,
            recorded_by: professor_id
        }));

        const results = await StudentAttendance.batchUpsert(attendances);

        // NOTIFICATION LOGIC
        try {
            const Notification = require('../models/Notification');
            const { query } = require('../config/db');

            // Find students marked as ABSENT
            const absentStudentIds = students
                .filter(s => s.status === 'ABSENT')
                .map(s => s.student_id);

            if (absentStudentIds.length > 0) {
                // Get module name from schedule
                const scheduleResult = await query(`
                    SELECT m.name as module_name
                    FROM schedules s
                    JOIN modules m ON s.module_id = m.id
                    WHERE s.id = $1
                `, [scheduleId]);

                const moduleName = scheduleResult.rows[0]?.module_name || 'Class';

                // Get User IDs for these students
                const usersResult = await query(`
                    SELECT user_id FROM students WHERE id = ANY($1)
                `, [absentStudentIds]);

                const recipientUserIds = usersResult.rows.map(u => u.user_id);

                if (recipientUserIds.length > 0) {
                    await Notification.notifyAbsence(
                        moduleName,
                        date,
                        recipientUserIds
                    );
                }
            }
        } catch (error) {
            console.error('Notification error:', error);
        }

        res.status(200).json({
            success: true,
            data: results
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get attendance history for a student
// @route   GET /api/v1/student-attendance/student/:studentId
exports.getStudentAttendance = async (req, res) => {
    try {
        const attendances = await StudentAttendance.findByStudent(req.params.studentId);
        res.status(200).json({
            success: true,
            count: attendances.length,
            data: attendances
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get weekly attendance report for a class
// @route   GET /api/v1/student-attendance/class/:classId/report?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
exports.getClassWeeklyReport = async (req, res) => {
    try {
        const { classId } = req.params;
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, error: 'Please provide startDate and endDate' });
        }

        // 1. Check if class exists and user has access
        const academicClass = await Class.findById(classId);
        if (!academicClass) {
            return res.status(404).json({ success: false, error: 'Class not found' });
        }

        // Authorize department heads
        if (['RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT'].includes(req.user.role_name)) {
            if (academicClass.department_id !== req.user.department_id) {
                return res.status(403).json({ success: false, error: 'You do not have access to this department report' });
            }
        }

        const report = await StudentAttendance.getClassWeeklyReport(classId, startDate, endDate);

        // Group by student for easier frontend processing
        const groupedReport = report.reduce((acc, curr) => {
            const studentId = curr.student_id;
            if (!acc[studentId]) {
                acc[studentId] = {
                    student_id: studentId,
                    first_name: curr.first_name,
                    last_name: curr.last_name,
                    registration_num: curr.registration_num,
                    attendances: []
                };
            }
            if (curr.module_name) {
                acc[studentId].attendances.push({
                    module_name: curr.module_name,
                    module_code: curr.module_code,
                    status: curr.status,
                    date: curr.date
                });
            }
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            data: Object.values(groupedReport)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
// @desc    Get attendance records with filters
// @route   GET /api/v1/student-attendance
// @access  Private (Professor, Admin, Director, Dept Head)
exports.getAttendanceList = async (req, res) => {
    try {
        const { classId, moduleId, startDate, endDate, studentName } = req.query;
        const filters = { classId, moduleId, startDate, endDate, studentName };

        // If user is a professor, restrict to their own schedules
        if (req.user.role_name === 'PROFESSOR') {
            filters.professorId = req.user.employee_id;
        }

        const data = await StudentAttendance.findAllByFilters(filters);

        res.status(200).json({
            success: true,
            count: data.length,
            data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get attendance history for the logged-in student
// @route   GET /api/v1/student-attendance/my-absences
// @access  Private (Student)
exports.getMyAttendance = async (req, res) => {
    try {
        if (!req.user.student_id) {
            return res.status(400).json({ success: false, error: 'Only students can check their personal attendance' });
        }
        const attendances = await StudentAttendance.findByStudent(req.user.student_id);
        res.status(200).json({
            success: true,
            count: attendances.length,
            data: attendances
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
