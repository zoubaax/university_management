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

    static async create({ name, description, yearly_price }) {
        const result = await query(
            'INSERT INTO departments (name, description, yearly_price) VALUES ($1, $2, $3) RETURNING *',
            [name, description, yearly_price || 0.00]
        );
        return result.rows[0];
    }

    static async update(id, { name, description, yearly_price }) {
        const result = await query(
            'UPDATE departments SET name = COALESCE($1, name), description = COALESCE($2, description), yearly_price = COALESCE($3, yearly_price), updated_at = CURRENT_TIMESTAMP WHERE id = $4 AND deleted_at IS NULL RETURNING *',
            [name, description, yearly_price, id]
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
