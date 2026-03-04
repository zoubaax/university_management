const { query, transaction } = require('../config/db');
const bcrypt = require('bcryptjs');

class Club {
    // Get all clubs
    static async findAll() {
        const result = await query(
            `SELECT c.*, d.name as department_name, u.email as contact_email
             FROM clubs c
             LEFT JOIN departments d ON c.department_id = d.id
             LEFT JOIN users u ON c.user_id = u.id
             ORDER BY c.created_at DESC`
        );
        return result.rows;
    }

    // Get a specific club by ID
    static async findById(id) {
        const result = await query(
            `SELECT c.*, d.name as department_name, u.email as contact_email
             FROM clubs c
             LEFT JOIN departments d ON c.department_id = d.id
             LEFT JOIN users u ON c.user_id = u.id
             WHERE c.id = $1`,
            [id]
        );
        return result.rows[0];
    }

    // Get a specific club by User ID (when the club president logs in)
    static async findByUserId(userId) {
        const result = await query(
            `SELECT c.*, d.name as department_name 
             FROM clubs c
             LEFT JOIN departments d ON c.department_id = d.id
             WHERE c.user_id = $1`,
            [userId]
        );
        return result.rows[0];
    }

    // Create a new club (creates User Account + Club Profile in a transaction)
    static async create({ name, description, email, password, department_id, logo_url, category }) {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        return await transaction(async (client) => {
            // 1. Get the CLUB_PRESIDENT role id
            const roleResult = await client.query(
                `SELECT id FROM roles WHERE name = 'CLUB_PRESIDENT'`
            );

            if (roleResult.rows.length === 0) {
                throw new Error("Role 'CLUB_PRESIDENT' not found in database.");
            }
            const roleId = roleResult.rows[0].id;

            // 2. Create the User Login
            const userResult = await client.query(
                `INSERT INTO users (email, password_hash, role_id, department_id)
                 VALUES ($1, $2, $3, $4) RETURNING id`,
                [email, password_hash, roleId, department_id]
            );
            const userId = userResult.rows[0].id;

            // 3. Create the Club Profile linked to the user
            const clubResult = await client.query(
                `INSERT INTO clubs (user_id, department_id, name, description, logo_url, category)
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [userId, department_id, name, description, logo_url || null, category || 'Social']
            );

            return clubResult.rows[0];
        });
    }

    // Update club details
    static async update(id, { name, description, logo_url, status, category }) {
        const result = await query(
            `UPDATE clubs 
             SET name = COALESCE($1, name),
                 description = COALESCE($2, description),
                 logo_url = COALESCE($3, logo_url),
                 status = COALESCE($4, status),
                 category = COALESCE($5, category),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $6 RETURNING *`,
            [name, description, logo_url, status, category, id]
        );
        return result.rows[0];
    }

    // Delete a club
    static async delete(id) {
        // Since clubs.user_id has ON DELETE CASCADE (or vice versa), deleting the user deletes the club profile.
        // But the best way is to delete the user account entirely.
        return await transaction(async (client) => {
            const clubRes = await client.query(`SELECT user_id FROM clubs WHERE id = $1`, [id]);
            if (clubRes.rows.length === 0) return null;

            const userId = clubRes.rows[0].user_id;

            // Delete the related user, which will cascade delete the club and members due to DB design
            await client.query(`DELETE FROM users WHERE id = $1`, [userId]);
            return true;
        });
    }
}

module.exports = Club;
