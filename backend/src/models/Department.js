const { query } = require('../config/db');

class Department {
    static async findAll() {
        const result = await query(
            'SELECT * FROM departments WHERE deleted_at IS NULL ORDER BY name ASC'
        );
        return result.rows;
    }

    static async findById(id) {
        const result = await query(
            'SELECT * FROM departments WHERE id = $1 AND deleted_at IS NULL',
            [id]
        );
        return result.rows[0];
    }

    static async create({ name, description }) {
        const result = await query(
            'INSERT INTO departments (name, description) VALUES ($1, $2) RETURNING *',
            [name, description]
        );
        return result.rows[0];
    }

    static async update(id, { name, description }) {
        const result = await query(
            'UPDATE departments SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND deleted_at IS NULL RETURNING *',
            [name, description, id]
        );
        return result.rows[0];
    }

    static async softDelete(id) {
        const result = await query(
            'UPDATE departments SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
            [id]
        );
        return result.rows[0];
    }
}

module.exports = Department;
