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

    static async getClassWeeklyReport(classId, startDate, endDate) {
        const result = await query(
            `WITH class_students AS (
                SELECT id, first_name, last_name, registration_num
                FROM students
                WHERE class_id = $1 AND deleted_at IS NULL
            ),
            attendance_records AS (
                SELECT 
                    sa.student_id,
                    m.name as module_name,
                    m.code as module_code,
                    sa.status,
                    sa.date
                FROM student_attendance sa
                JOIN schedules sch ON sa.schedule_id = sch.id
                JOIN modules m ON sch.module_id = m.id
                WHERE sa.date >= $2 AND sa.date <= $3
            )
            SELECT 
                cs.id as student_id,
                cs.first_name,
                cs.last_name,
                cs.registration_num,
                ar.module_name,
                ar.module_code,
                ar.status,
                ar.date
            FROM class_students cs
            LEFT JOIN attendance_records ar ON cs.id = ar.student_id
            ORDER BY cs.last_name, cs.first_name, ar.date`,
            [classId, startDate, endDate]
        );
        return result.rows;
    }
}

module.exports = StudentAttendance;
