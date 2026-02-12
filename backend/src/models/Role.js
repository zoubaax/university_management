const { query } = require('../config/db');

class Role {
    static async findAll() {
        const result = await query(`
            SELECT r.*, COUNT(u.id) as user_count 
            FROM roles r
            LEFT JOIN users u ON r.id = u.role_id AND u.deleted_at IS NULL
            GROUP BY r.id
            ORDER BY r.id ASC
        `);
        return result.rows;
    }

    static async findById(id) {
        const result = await query('SELECT * FROM roles WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async findByName(name) {
        const result = await query('SELECT * FROM roles WHERE name = $1', [name]);
        return result.rows[0];
    }

    static async create({ name, description, permissions }) {
        const result = await query(
            `INSERT INTO roles (name, description, permissions) 
             VALUES ($1, $2, $3) 
             RETURNING *`,
            [name, description, JSON.stringify(permissions || [])]
        );
        return result.rows[0];
    }

    static async update(id, { name, description, permissions }) {
        const result = await query(
            `UPDATE roles 
             SET name = COALESCE($1, name),
                 description = COALESCE($2, description),
                 permissions = COALESCE($3, permissions)
             WHERE id = $4
             RETURNING *`,
            [name, description, permissions ? JSON.stringify(permissions) : null, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        // Check if role is assigned to any active user
        const usersCheck = await query(
            'SELECT COUNT(*) as count FROM users WHERE role_id = $1 AND deleted_at IS NULL',
            [id]
        );

        if (parseInt(usersCheck.rows[0].count) > 0) {
            throw new Error('Cannot delete role as it is assigned to users');
        }

        const result = await query('DELETE FROM roles WHERE id = $1 RETURNING id', [id]);

        if (!result.rows[0]) {
            return null;
        }

        return result.rows[0];
    }
}

module.exports = Role;
