const { query } = require('../config/db');

class Employee {
    static async findAll() {
        const result = await query(
            `SELECT e.*, d.name as department_name, u.email as user_email 
       FROM employees e 
       LEFT JOIN departments d ON e.department_id = d.id 
       LEFT JOIN users u ON e.user_id = u.id 
       WHERE e.deleted_at IS NULL ORDER BY e.last_name ASC`
        );
        return result.rows;
    }

    static async findById(id) {
        const result = await query(
            `SELECT e.*, d.name as department_name, u.email as user_email 
       FROM employees e 
       LEFT JOIN departments d ON e.department_id = d.id 
       LEFT JOIN users u ON e.user_id = u.id 
       WHERE e.id = $1 AND e.deleted_at IS NULL`,
            [id]
        );
        return result.rows[0];
    }

    static async create(data) {
        const { user_id, department_id, first_name, last_name, type } = data;
        const result = await query(
            `INSERT INTO employees (user_id, department_id, first_name, last_name, type) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
            [user_id, department_id, first_name, last_name, type]
        );
        return result.rows[0];
    }

    static async update(id, data) {
        const { department_id, first_name, last_name, type } = data;
        const result = await query(
            `UPDATE employees 
       SET department_id = $1, first_name = $2, last_name = $3, type = $4, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 AND deleted_at IS NULL 
       RETURNING *`,
            [department_id, first_name, last_name, type, id]
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
