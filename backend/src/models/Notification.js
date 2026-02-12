const { query } = require('../config/db');

class Notification {
    // Get notifications for a user
    static async getByUserId(userId, { limit = 50, offset = 0, unreadOnly = false }) {
        let queryStr = `
            SELECT * FROM notifications
            WHERE user_id = $1
        `;

        const params = [userId];
        let paramCount = 2;

        if (unreadOnly) {
            queryStr += ` AND is_read = FALSE`;
        }

        queryStr += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(limit, offset);

        const result = await query(queryStr, params);
        return result.rows;
    }

    // Get unread count for a user
    static async getUnreadCount(userId) {
        const result = await query(
            `SELECT COUNT(*) as count
             FROM notifications
             WHERE user_id = $1 AND is_read = FALSE`,
            [userId]
        );

        return parseInt(result.rows[0].count);
    }

    // Create a notification
    static async create(data) {
        const { user_id, type, title, message, link, related_id } = data;

        const result = await query(
            `INSERT INTO notifications (user_id, type, title, message, link, related_id)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [user_id, type, title, message, link || null, related_id || null]
        );

        return result.rows[0];
    }

    // Create multiple notifications (bulk)
    static async createBulk(notifications) {
        if (!notifications || notifications.length === 0) return [];

        const values = [];
        const params = [];
        let paramIndex = 1;

        notifications.forEach((notif) => {
            values.push(
                `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5})`
            );
            params.push(
                notif.user_id,
                notif.type,
                notif.title,
                notif.message,
                notif.link || null,
                notif.related_id || null
            );
            paramIndex += 6;
        });

        const queryStr = `
            INSERT INTO notifications (user_id, type, title, message, link, related_id)
            VALUES ${values.join(', ')}
            RETURNING *
        `;

        const result = await query(queryStr, params);
        return result.rows;
    }

    // Mark notification as read
    static async markAsRead(notificationId, userId) {
        const result = await query(
            `UPDATE notifications 
             SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
             WHERE id = $1 AND user_id = $2 AND is_read = FALSE
             RETURNING *`,
            [notificationId, userId]
        );

        return result.rows[0];
    }

    // Mark all notifications as read for a user
    static async markAllAsRead(userId) {
        const result = await query(
            `UPDATE notifications 
             SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
             WHERE user_id = $1 AND is_read = FALSE
             RETURNING *`,
            [userId]
        );

        return result.rows;
    }

    // Delete a notification
    static async delete(notificationId, userId) {
        const result = await query(
            `DELETE FROM notifications 
             WHERE id = $1 AND user_id = $2
             RETURNING *`,
            [notificationId, userId]
        );

        return result.rows[0];
    }

    // Delete old read notifications (cleanup)
    static async deleteOldRead(daysOld = 30) {
        const result = await query(
            `DELETE FROM notifications 
             WHERE is_read = TRUE 
               AND read_at < CURRENT_TIMESTAMP - INTERVAL '${daysOld} days'
             RETURNING *`
        );

        return result.rows;
    }

    // Helper: Create notification for file upload
    static async notifyFileUpload(uploadedBy, fileName, fileId, recipientIds) {
        const notifications = recipientIds.map(recipientId => ({
            user_id: recipientId,
            type: 'file_upload',
            title: 'New File Uploaded',
            message: `${uploadedBy} uploaded a new file: ${fileName}`,
            link: `/resources`,
            related_id: fileId
        }));

        return await this.createBulk(notifications);
    }

    // Helper: Create notification for certificate request
    static async notifyCertificateRequest(studentName, studentId, certificateType, recipientIds) {
        const notifications = recipientIds.map(recipientId => ({
            user_id: recipientId,
            type: 'certificate_request',
            title: 'New Certificate Request',
            message: `${studentName} requested a ${certificateType} certificate`,
            link: `/certificates`,
            related_id: studentId
        }));

        return await this.createBulk(notifications);
    }

    // Helper: Create notification for absence alert
    static async notifyAbsence(studentName, className, date, recipientIds) {
        const notifications = recipientIds.map(recipientId => ({
            user_id: recipientId,
            type: 'absence_alert',
            title: 'Student Absence',
            message: `${studentName} was marked absent in ${className} on ${date}`,
            link: `/student-absences`,
            related_id: null
        }));

        return await this.createBulk(notifications);
    }

    // Helper: Create notification for grade posted
    static async notifyGradePosted(studentId, moduleName, grade) {
        return await this.create({
            user_id: studentId,
            type: 'grade_posted',
            title: 'New Grade Posted',
            message: `Your grade for ${moduleName} has been posted: ${grade}`,
            link: `/grades`,
            related_id: null
        });
    }

    // Helper: Create announcement for multiple users
    static async createAnnouncement(title, message, recipientIds, link = null) {
        const notifications = recipientIds.map(recipientId => ({
            user_id: recipientId,
            type: 'announcement',
            title,
            message,
            link,
            related_id: null
        }));

        return await this.createBulk(notifications);
    }
}

module.exports = Notification;
