const { query } = require('../config/db');

class Class {
    static async findAll() {
        const result = await query(
            `    SELECT c.*, s.name as speciality_name, d.name as department_name, COUNT(st.id) as student_count
                 FROM classes c
                 JOIN specialities s ON c.speciality_id = s.id
                 JOIN departments d ON s.department_id = d.id
                 LEFT JOIN students st ON c.id = st.class_id AND st.deleted_at IS NULL
                 WHERE c.deleted_at IS NULL
                 GROUP BY c.id, s.name, d.name
                 ORDER BY c.academic_year DESC, c.name ASC`
        );
        return result.rows;
    }

    static async findById(id) {
        const result = await query(
            `SELECT c.*, s.name as speciality_name, s.department_id
             FROM classes c
             JOIN specialities s ON c.speciality_id = s.id
             WHERE c.id = $1 AND c.deleted_at IS NULL`,
            [id]
        );
        return result.rows[0];
    }

    static async findBySpeciality(specialityId) {
        const result = await query(
            'SELECT * FROM classes WHERE speciality_id = $1 AND deleted_at IS NULL ORDER BY name ASC',
            [specialityId]
        );
        return result.rows;
    }

    static async findByDepartment(departmentId) {
        const result = await query(
            `SELECT c.*, s.name as speciality_name
             FROM classes c
             JOIN specialities s ON c.speciality_id = s.id
             WHERE s.department_id = $1 AND c.deleted_at IS NULL
             ORDER BY c.academic_year DESC, c.name ASC`,
            [departmentId]
        );
        return result.rows;
    }

    static async create({ speciality_id, name, level, academic_year }) {
        const result = await query(
            `INSERT INTO classes (speciality_id, name, level, academic_year)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [speciality_id, name, level, academic_year]
        );
        return result.rows[0];
    }

    static async update(id, { speciality_id, name, level, academic_year }) {
        const result = await query(
            `UPDATE classes 
             SET speciality_id = COALESCE($1, speciality_id),
                 name = COALESCE($2, name),
                 level = COALESCE($3, level),
                 academic_year = COALESCE($4, academic_year),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $5 AND deleted_at IS NULL
             RETURNING *`,
            [speciality_id, name, level, academic_year, id]
        );
        return result.rows[0];
    }

    static async softDelete(id) {
        const result = await query(
            'UPDATE classes SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
            [id]
        );
        return result.rows[0];
    }
}

module.exports = Class;
