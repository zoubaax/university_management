const { query } = require('../config/db');

class StudentAttendance {
    static async findAllBySession(scheduleId, date) {
        const result = await query(
            `SELECT sa.*, s.first_name, s.last_name, s.registration_num
             FROM student_attendance sa
             JOIN students s ON sa.student_id = s.id
             WHERE sa.schedule_id = $1 AND sa.date = $2`,
            [scheduleId, date]
        );
        return result.rows;
    }

    static async upsert(data) {
        const { student_id, schedule_id, date, status, recorded_by, remarks } = data;
        const result = await query(
            `INSERT INTO student_attendance (student_id, schedule_id, date, status, recorded_by, remarks)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (student_id, schedule_id, date) 
             DO UPDATE SET 
                status = EXCLUDED.status,
                recorded_by = EXCLUDED.recorded_by,
                remarks = EXCLUDED.remarks,
                updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [student_id, schedule_id, date, status, recorded_by, remarks]
        );
        return result.rows[0];
    }

    static async batchUpsert(attendances) {
        const results = [];
        for (const attendance of attendances) {
            results.push(await this.upsert(attendance));
        }
        return results;
    }

    static async findByStudent(studentId) {
        const result = await query(
            `SELECT sa.*, m.name as module_name, m.code as module_code, e.first_name as professor_first_name, e.last_name as professor_last_name
             FROM student_attendance sa
             JOIN schedules sch ON sa.schedule_id = sch.id
             JOIN modules m ON sch.module_id = m.id
             LEFT JOIN employees e ON sa.recorded_by = e.id
             WHERE sa.student_id = $1
             ORDER BY sa.date DESC`,
            [studentId]
        );
        return result.rows;
    }
}

module.exports = StudentAttendance;
