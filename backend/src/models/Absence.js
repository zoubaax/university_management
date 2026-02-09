const { query } = require('../config/db');

class Absence {
    static async findAll() {
        const result = await query(
            `SELECT a.*, e.first_name, e.last_name, e.type as employee_type, d.name as department_name
             FROM absences a
             JOIN employees e ON a.employee_id = e.id
             LEFT JOIN departments d ON e.department_id = d.id
             WHERE a.deleted_at IS NULL
             ORDER BY a.start_date DESC`
        );
        return result.rows;
    }

    static async findById(id) {
        const result = await query(
            `SELECT a.*, e.first_name, e.last_name
             FROM absences a
             JOIN employees e ON a.employee_id = e.id
             WHERE a.id = $1 AND a.deleted_at IS NULL`,
            [id]
        );
        return result.rows[0];
    }

    static async findByEmployee(employeeId) {
        const result = await query(
            'SELECT * FROM absences WHERE employee_id = $1 AND deleted_at IS NULL ORDER BY start_date DESC',
            [employeeId]
        );
        return result.rows;
    }

    static async create({ employee_id, start_date, end_date, type, reason, status, recorded_by, attachment_url }) {
        const result = await query(
            `INSERT INTO absences (employee_id, start_date, end_date, type, reason, status, recorded_by, attachment_url)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [employee_id, start_date, end_date, type, reason, status || 'PENDING', recorded_by, attachment_url]
        );
        return result.rows[0];
    }

    static async update(id, { start_date, end_date, type, reason, status, attachment_url }) {
        const result = await query(
            `UPDATE absences 
             SET start_date = COALESCE($1, start_date),
                 end_date = COALESCE($2, end_date),
                 type = COALESCE($3, type),
                 reason = COALESCE($4, reason),
                 status = COALESCE($5, status),
                 attachment_url = COALESCE($6, attachment_url),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $7 AND deleted_at IS NULL
             RETURNING *`,
            [start_date, end_date, type, reason, status, attachment_url, id]
        );
        return result.rows[0];
    }

    static async softDelete(id) {
        const result = await query(
            'UPDATE absences SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
            [id]
        );
        return result.rows[0];
    }
}

module.exports = Absence;
