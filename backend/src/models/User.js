const { query } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User {
    static async findByEmail(email) {
        const result = await query(
            `SELECT u.id, u.email, u.role_id, u.department_id, u.is_active, u.created_at, r.name as role_name,
                    e.id as employee_id, s.id as student_id
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       LEFT JOIN employees e ON u.id = e.user_id
       LEFT JOIN students s ON u.id = s.user_id
       WHERE u.email = $1 AND u.deleted_at IS NULL`,
            [email]
        );
        return result.rows[0];
    }

    static async findWithPassword(email) {
        const result = await query(
            `SELECT u.id, u.email, u.department_id, u.is_active, u.password_hash, r.name as role_name,
                    e.id as employee_id, s.id as student_id
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       LEFT JOIN employees e ON u.id = e.user_id
       LEFT JOIN students s ON u.id = s.user_id
       WHERE u.email = $1 AND u.deleted_at IS NULL`,
            [email]
        );
        return result.rows[0];
    }

    static async findById(id) {
        const result = await query(
            `SELECT u.id, u.email, u.role_id, u.department_id, u.is_active, u.created_at, r.name as role_name,
                    e.id as employee_id, s.id as student_id
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       LEFT JOIN employees e ON u.id = e.user_id
       LEFT JOIN students s ON u.id = s.user_id
       WHERE u.id = $1 AND u.deleted_at IS NULL`,
            [id]
        );
        return result.rows[0];
    }

    static async create({ email, password, role_id, department_id }) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await query(
            `INSERT INTO users (email, password_hash, role_id, department_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, email, role_id, department_id, created_at`,
            [email, hashedPassword, role_id, department_id]
        );
        return result.rows[0];
    }

    static async comparePassword(enteredPassword, hashedPassword) {
        return await bcrypt.compare(enteredPassword, hashedPassword);
    }

    static async update(id, { email, password, role_id, department_id, is_active }) {
        let hashedPassword = null;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        const result = await query(
            `UPDATE users 
       SET email = COALESCE($1, email), 
           password_hash = COALESCE($2, password_hash),
           role_id = COALESCE($3, role_id), 
           department_id = COALESCE($4, department_id),
           is_active = COALESCE($5, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND deleted_at IS NULL
       RETURNING id, email, role_id, department_id, is_active`,
            [email, hashedPassword, role_id, department_id, is_active, id]
        );
        return result.rows[0];
    }

    static getSignedJwtToken(user) {
        return jwt.sign(
            {
                id: user.id,
                role: user.role_name,
                dept: user.department_id
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );
    }

    static getSignedRefreshToken(user) {
        return jwt.sign(
            {
                id: user.id,
                role: user.role_name,
                dept: user.department_id
            },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRE }
        );
    }
}

module.exports = User;
