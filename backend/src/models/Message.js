const { query } = require('../config/db');

class Message {
    // Get inbox messages for a user
    static async getInbox(userId, userType, { limit = 50, offset = 0, unreadOnly = false }) {
        let queryStr = `
            SELECT m.*,
                   CASE 
                       WHEN m.sender_type = 'employee' THEN COALESCE(e.first_name || ' ' || e.last_name, u_gen.email)
                       WHEN m.sender_type = 'student' THEN COALESCE(s.first_name || ' ' || s.last_name, u_gen.email)
                       ELSE u_gen.email
                   END as sender_name,
                   COALESCE(ue.email, us.email, u_gen.email) as sender_email,
                   CASE 
                       WHEN m.sender_type = 'employee' THEN COALESCE(r.name, 'Staff')
                       WHEN m.sender_type = 'student' THEN 'Student'
                       ELSE 'User'
                   END as sender_role
            FROM messages m
            LEFT JOIN employees e ON m.sender_id = e.id AND m.sender_type = 'employee'
            LEFT JOIN students s ON m.sender_id = s.id AND m.sender_type = 'student'
            LEFT JOIN users u_gen ON m.sender_id = u_gen.id
            LEFT JOIN users ue ON e.user_id = ue.id
            LEFT JOIN users us ON s.user_id = us.id
            LEFT JOIN roles r ON ue.role_id = r.id
            WHERE m.recipient_id = $1 
              AND m.recipient_type = $2
              AND m.is_deleted_by_recipient = FALSE
        `;

        const params = [userId, userType];
        let paramCount = 3;

        if (unreadOnly) {
            queryStr += ` AND m.is_read = FALSE`;
        }

        queryStr += ` ORDER BY m.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(limit, offset);

        const result = await query(queryStr, params);
        return result.rows;
    }

    // Get sent messages for a user
    static async getSent(userId, userType, { limit = 50, offset = 0 }) {
        const queryStr = `
            SELECT m.*,
                   CASE 
                       WHEN m.recipient_type = 'employee' THEN COALESCE(e.first_name || ' ' || e.last_name, u_gen.email)
                       WHEN m.recipient_type = 'student' THEN COALESCE(s.first_name || ' ' || s.last_name, u_gen.email)
                       ELSE u_gen.email
                   END as recipient_name,
                   COALESCE(ue.email, us.email, u_gen.email) as recipient_email
            FROM messages m
            LEFT JOIN employees e ON m.recipient_id = e.id AND m.recipient_type = 'employee'
            LEFT JOIN students s ON m.recipient_id = s.id AND m.recipient_type = 'student'
            LEFT JOIN users u_gen ON m.recipient_id = u_gen.id
            LEFT JOIN users ue ON e.user_id = ue.id
            LEFT JOIN users us ON s.user_id = us.id
            WHERE m.sender_id = $1 
              AND m.sender_type = $2
              AND m.is_deleted_by_sender = FALSE
            ORDER BY m.created_at DESC
            LIMIT $3 OFFSET $4
        `;

        const result = await query(queryStr, [userId, userType, limit, offset]);
        return result.rows;
    }

    // Get a single message by ID
    static async findById(messageId, userId, userType) {
        const queryStr = `
            SELECT m.*,
                   CASE 
                       WHEN m.sender_type = 'employee' THEN COALESCE(se.first_name || ' ' || se.last_name, use_gen.email)
                       WHEN m.sender_type = 'student' THEN COALESCE(ss.first_name || ' ' || ss.last_name, use_gen.email)
                       ELSE use_gen.email
                   END as sender_name,
                   COALESCE(use.email, uss.email, use_gen.email) as sender_email,
                   CASE 
                       WHEN m.recipient_type = 'employee' THEN COALESCE(re.first_name || ' ' || re.last_name, ure_gen.email)
                       WHEN m.recipient_type = 'student' THEN COALESCE(rs.first_name || ' ' || rs.last_name, ure_gen.email)
                       ELSE ure_gen.email
                   END as recipient_name,
                   COALESCE(ure.email, urs.email, ure_gen.email) as recipient_email
            FROM messages m
            LEFT JOIN employees se ON m.sender_id = se.id AND m.sender_type = 'employee'
            LEFT JOIN students ss ON m.sender_id = ss.id AND m.sender_type = 'student'
            LEFT JOIN employees re ON m.recipient_id = re.id AND m.recipient_type = 'employee'
            LEFT JOIN students rs ON m.recipient_id = rs.id AND m.recipient_type = 'student'
            LEFT JOIN users use_gen ON m.sender_id = use_gen.id
            LEFT JOIN users ure_gen ON m.recipient_id = ure_gen.id
            LEFT JOIN users use ON se.user_id = use.id
            LEFT JOIN users uss ON ss.user_id = uss.id
            LEFT JOIN users ure ON re.user_id = ure.id
            LEFT JOIN users urs ON rs.user_id = urs.id
            WHERE m.id = $1
              AND (
                  (m.sender_id = $2 AND m.sender_type = $3) OR 
                  (m.recipient_id = $2 AND m.recipient_type = $3)
              )
        `;

        const result = await query(queryStr, [messageId, userId, userType]);
        return result.rows[0];
    }

    // Create a new message
    static async create(data) {
        const { sender_id, sender_type, recipient_id, recipient_type, subject, body } = data;

        const result = await query(
            `INSERT INTO messages (sender_id, sender_type, recipient_id, recipient_type, subject, body)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [sender_id, sender_type, recipient_id, recipient_type, subject, body]
        );

        return result.rows[0];
    }

    // Mark message as read
    static async markAsRead(messageId, userId, userType) {
        const result = await query(
            `UPDATE messages 
             SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
             WHERE id = $1 
               AND recipient_id = $2 
               AND recipient_type = $3
               AND is_read = FALSE
             RETURNING *`,
            [messageId, userId, userType]
        );

        return result.rows[0];
    }

    // Toggle starred status
    static async toggleStar(messageId, userId, userType) {
        const result = await query(
            `UPDATE messages 
             SET is_starred = NOT is_starred
             WHERE id = $1 
               AND (
                   (recipient_id = $2 AND recipient_type = $3) OR
                   (sender_id = $2 AND sender_type = $3)
               )
             RETURNING *`,
            [messageId, userId, userType]
        );

        return result.rows[0];
    }

    // Delete message (soft delete)
    static async delete(messageId, userId, userType) {
        const result = await query(
            `UPDATE messages 
             SET is_deleted_by_sender = CASE WHEN sender_id = $2 AND sender_type = $3 THEN TRUE ELSE is_deleted_by_sender END,
                 is_deleted_by_recipient = CASE WHEN recipient_id = $2 AND recipient_type = $3 THEN TRUE ELSE is_deleted_by_recipient END
             WHERE id = $1 
               AND (
                   (sender_id = $2 AND sender_type = $3) OR 
                   (recipient_id = $2 AND recipient_type = $3)
               )
             RETURNING *`,
            [messageId, userId, userType]
        );

        return result.rows[0];
    }

    // Get unread count
    static async getUnreadCount(userId, userType) {
        const result = await query(
            `SELECT COUNT(*) as count
             FROM messages
             WHERE recipient_id = $1 
               AND recipient_type = $2
               AND is_read = FALSE
               AND is_deleted_by_recipient = FALSE`,
            [userId, userType]
        );

        return parseInt(result.rows[0].count);
    }

    // Search users (employees and students) for recipient selection
    static async searchUsers(searchTerm, limit = 20) {
        const searchPattern = `%${searchTerm.toLowerCase()}%`;

        const queryStr = `
            (SELECT 
                e.id,
                'employee' as user_type,
                e.first_name || ' ' || e.last_name as name,
                u.email,
                r.name as role,
                d.name as department
             FROM employees e
             LEFT JOIN users u ON e.user_id = u.id
             LEFT JOIN roles r ON u.role_id = r.id
             LEFT JOIN departments d ON e.department_id = d.id
             WHERE LOWER(e.first_name || ' ' || e.last_name) LIKE $1
                OR LOWER(u.email) LIKE $1
             LIMIT $2)
            UNION ALL
            (SELECT 
                s.id,
                'student' as user_type,
                s.first_name || ' ' || s.last_name as name,
                u.email,
                'Student' as role,
                c.name as department
             FROM students s
             LEFT JOIN users u ON s.user_id = u.id
             LEFT JOIN classes c ON s.class_id = c.id
             WHERE LOWER(s.first_name || ' ' || s.last_name) LIKE $1
                OR LOWER(u.email) LIKE $1
                OR LOWER(s.registration_num) LIKE $1
             LIMIT $2)
            ORDER BY name
            LIMIT $2
        `;

        const result = await query(queryStr, [searchPattern, limit]);
        return result.rows;
    }
}

module.exports = Message;
