const { query } = require('../config/db');

class Module {
    static async findAll() {
        const result = await query(
            `SELECT m.*, s.name as speciality_name 
             FROM modules m
             JOIN specialities s ON m.speciality_id = s.id
             WHERE m.deleted_at IS NULL
             ORDER BY m.name ASC`
        );
        return result.rows;
    }

    static async findBySpeciality(specialityId) {
        const result = await query(
            `SELECT m.*, s.name as speciality_name 
             FROM modules m
             JOIN specialities s ON m.speciality_id = s.id
             WHERE m.speciality_id = $1 AND m.deleted_at IS NULL
             ORDER BY m.name ASC`,
            [specialityId]
        );
        return result.rows;
    }

    static async findById(id) {
        const result = await query(
            `SELECT m.*, s.name as speciality_name 
             FROM modules m
             JOIN specialities s ON m.speciality_id = s.id
             WHERE m.id = $1 AND m.deleted_at IS NULL`,
            [id]
        );
        return result.rows[0];
    }

    static async create(data) {
        let { speciality_id, name, code, coefficient, description } = data;

        if (!code) {
            const date = new Date();
            const year = date.getFullYear();
            const countResult = await query('SELECT count(*) FROM modules');
            const count = parseInt(countResult.rows[0].count) + 1;
            code = `M${year}-${count.toString().padStart(4, '0')}`;
        }

        const result = await query(
            `INSERT INTO modules (speciality_id, name, code, coefficient, description)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [speciality_id, name, code, coefficient || 1.0, description]
        );
        return result.rows[0];
    }

    static async update(id, data) {
        const { speciality_id, name, code, coefficient, description } = data;
        const result = await query(
            `UPDATE modules 
             SET speciality_id = COALESCE($1, speciality_id),
                 name = COALESCE($2, name),
                 code = COALESCE($3, code),
                 coefficient = COALESCE($4, coefficient),
                 description = COALESCE($5, description),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $6 AND deleted_at IS NULL
             RETURNING *`,
            [speciality_id, name, code, coefficient, description, id]
        );
        return result.rows[0];
    }

    static async softDelete(id) {
        const result = await query(
            'UPDATE modules SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
            [id]
        );
        return result.rows[0];
    }

    // --- Class Assignments ---

    static async assignToClass(data) {
        const { class_id, module_id, professor_id, hours_per_week } = data;
        const result = await query(
            `INSERT INTO class_modules (class_id, module_id, professor_id, hours_per_week)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (class_id, module_id) 
             DO UPDATE SET 
                professor_id = EXCLUDED.professor_id,
                hours_per_week = EXCLUDED.hours_per_week,
                updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [class_id, module_id, professor_id, hours_per_week || 0]
        );
        return result.rows[0];
    }

    static async getClassModules(classId) {
        const result = await query(
            `SELECT cm.*, m.name as module_name, m.code as module_code,
                    e.first_name as professor_first_name, e.last_name as professor_last_name
             FROM class_modules cm
             JOIN modules m ON cm.module_id = m.id
             LEFT JOIN employees e ON cm.professor_id = e.id
             WHERE cm.class_id = $1`,
            [classId]
        );
        return result.rows;
    }

    static async removeFromClass(classId, moduleId) {
        const result = await query(
            'DELETE FROM class_modules WHERE class_id = $1 AND module_id = $2 RETURNING *',
            [classId, moduleId]
        );
        return result.rows[0];
    }
}

module.exports = Module;
