const StudentAttendance = require('../models/StudentAttendance');
const Student = require('../models/Student');
const Schedule = require('../models/Schedule');

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
