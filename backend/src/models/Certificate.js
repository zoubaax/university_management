const { query } = require('../config/db');

class Certificate {
    static async createRequest(data) {
        const { student_id, academic_year, type = 'ENROLLMENT' } = data;
        const result = await query(
            `INSERT INTO certificate_requests (student_id, academic_year, type)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [student_id, academic_year, type]
        );
        return result.rows[0];
    }

    static async findByStudent(studentId) {
        const result = await query(
            `SELECT cr.*, s.registration_num, u.email
             FROM certificate_requests cr
             JOIN students s ON cr.student_id = s.id
             JOIN users u ON s.user_id = u.id
             WHERE cr.student_id = $1
             ORDER BY cr.requested_at DESC`,
            [studentId]
        );
        return result.rows;
    }

    static async findByDepartment(departmentId) {
        const result = await query(
            `SELECT cr.*, s.first_name, s.last_name, s.registration_num, spec.name as speciality_name, c.name as class_name, c.level
             FROM certificate_requests cr
             JOIN students s ON cr.student_id = s.id
             JOIN specialities spec ON s.speciality_id = spec.id
             JOIN classes c ON s.class_id = c.id
             WHERE spec.department_id = $1
             ORDER BY cr.requested_at DESC`,
            [departmentId]
        );
        return result.rows;
    }

    static async updateStatus(id, { status, processed_by, remarks }) {
        const result = await query(
            `UPDATE certificate_requests
             SET status = $1,
                 processed_by = $2,
                 remarks = $3,
                 processed_at = CURRENT_TIMESTAMP,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $4
             RETURNING *`,
            [status, processed_by, remarks, id]
        );
        return result.rows[0];
    }

    static async getFullDetails(id) {
        const result = await query(
            `SELECT cr.*, 
                    s.first_name, s.last_name, s.registration_num,
                    spec.name as speciality_name,
                    dept.name as department_name,
                    c.name as class_name, c.level
             FROM certificate_requests cr
             JOIN students s ON cr.student_id = s.id
             JOIN specialities spec ON s.speciality_id = spec.id
             JOIN departments dept ON spec.department_id = dept.id
             JOIN classes c ON s.class_id = c.id
             WHERE cr.id = $1`,
            [id]
        );
        return result.rows[0];
    }
}

module.exports = Certificate;
