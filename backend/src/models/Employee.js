const { query } = require('../config/db');

class Employee {
    static async findAll(filters = {}) {
        let sql = `SELECT e.*, d.name as department_name, u.email as user_email, r.name as role_name, r.id as role_id,
                          e.base_salary, e.deduction_per_absence
                   FROM employees e 
                   LEFT JOIN departments d ON e.department_id = d.id 
                   LEFT JOIN users u ON e.user_id = u.id 
                   LEFT JOIN roles r ON u.role_id = r.id
                   WHERE e.deleted_at IS NULL`;

        const params = [];
        if (filters.type) {
            params.push(filters.type);
            sql += ` AND e.type = $${params.length}`;
        }

        sql += ` ORDER BY e.last_name ASC`;
        const result = await query(sql, params);
        return result.rows;
    }

    static async findById(id) {
        const result = await query(
            `SELECT e.*, d.name as department_name, u.email as user_email, r.name as role_name, r.id as role_id,
                    e.base_salary, e.deduction_per_absence
             FROM employees e 
             LEFT JOIN departments d ON e.department_id = d.id 
             LEFT JOIN users u ON e.user_id = u.id 
             LEFT JOIN roles r ON u.role_id = r.id
             WHERE e.id = $1 AND e.deleted_at IS NULL`,
            [id]
        );
        return result.rows[0];
    }

    static async create(data) {
        const { user_id, department_id, first_name, last_name, type, base_salary, deduction_per_absence } = data;
        const result = await query(
            `INSERT INTO employees (user_id, department_id, first_name, last_name, type, base_salary, deduction_per_absence) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING *`,
            [user_id, department_id, first_name, last_name, type, base_salary || 0.00, deduction_per_absence || 0.00]
        );
        return result.rows[0];
    }

    static async update(id, data) {
        const { department_id, first_name, last_name, type, base_salary, deduction_per_absence } = data;
        const result = await query(
            `UPDATE employees 
             SET department_id = $1, first_name = $2, last_name = $3, type = $4, 
                 base_salary = $5, deduction_per_absence = $6, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $7 AND deleted_at IS NULL 
             RETURNING *`,
            [department_id, first_name, last_name, type, base_salary, deduction_per_absence, id]
        );
        return result.rows[0];
    }

    static async softDelete(id) {
        const result = await query(
            'UPDATE employees SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
            [id]
        );
        return result.rows[0];
    }
}

module.exports = Employee;
