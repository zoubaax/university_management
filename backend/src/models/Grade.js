const { query } = require('../config/db');

class Grade {
    static async findByClassAndModule(classId, moduleId, academicYear) {
        const result = await query(
            `SELECT g.*, s.id as student_id, s.first_name, s.last_name, s.registration_num
             FROM students s
             LEFT JOIN student_grades g ON s.id = g.student_id 
                AND g.module_id = $2 
                AND g.academic_year = $3
             WHERE s.class_id = $1 AND s.deleted_at IS NULL
             ORDER BY s.last_name ASC, s.first_name ASC`,
            [classId, moduleId, academicYear]
        );
        return result.rows;
    }

    static async upsert(data) {
        const {
            student_id, module_id, class_id, professor_id,
            cc1, cc2, exam, semester, academic_year
        } = data;

        const result = await query(
            `INSERT INTO student_grades (
                student_id, module_id, class_id, professor_id,
                cc1, cc2, exam, semester, academic_year
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (student_id, module_id, academic_year)
            DO UPDATE SET
                cc1 = EXCLUDED.cc1,
                cc2 = EXCLUDED.cc2,
                exam = EXCLUDED.exam,
                professor_id = EXCLUDED.professor_id,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *`,
            [student_id, module_id, class_id, professor_id, cc1, cc2, exam, semester, academic_year]
        );
        return result.rows[0];
    }

    static async findByStudent(studentId, academicYear) {
        const result = await query(
            `SELECT g.*, m.name as module_name, m.code as module_code, m.coefficient
             FROM student_grades g
             JOIN modules m ON g.module_id = m.id
             WHERE g.student_id = $1 AND g.academic_year = $2
             ORDER BY m.semester ASC, m.name ASC`,
            [studentId, academicYear]
        );
        return result.rows;
    }
}

module.exports = Grade;
