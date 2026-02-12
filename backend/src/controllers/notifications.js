const Notification = require('../models/Notification');

// @desc    Get user's notifications
// @route   GET /api/v1/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit, offset, unreadOnly } = req.query;

        const notifications = await Notification.getByUserId(userId, {
            limit: parseInt(limit) || 50,
            offset: parseInt(offset) || 0,
            unreadOnly: unreadOnly === 'true'
        });

        res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (err) {
        console.error('getNotifications error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get unread notification count
// @route   GET /api/v1/notifications/unread/count
// @access  Private
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const count = await Notification.getUnreadCount(userId);

        res.status(200).json({
            success: true,
            data: { count }
        });
    } catch (err) {
        console.error('getUnreadCount error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const notification = await Notification.markAsRead(id, userId);

        if (!notification) {
            return res.status(404).json({
                success: false,
                error: 'Notification not found or already read'
            });
        }

        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (err) {
        console.error('markAsRead error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/v1/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await Notification.markAllAsRead(userId);

        res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (err) {
        console.error('markAllAsRead error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Delete notification
// @route   DELETE /api/v1/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const notification = await Notification.delete(id, userId);

        if (!notification) {
            return res.status(404).json({
                success: false,
                error: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        console.error('deleteNotification error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Create announcement (admin only)
// @route   POST /api/v1/notifications/announcement
// @access  Private (Admin)
exports.createAnnouncement = async (req, res) => {
    try {
        let { title, message, recipient_ids, target_audience } = req.body;

        // If target_audience is provided, fetch IDs automatically
        if (target_audience) {
            const { query } = require('../config/db');
            let sql = 'SELECT id FROM users WHERE is_active = true AND deleted_at IS NULL';

            if (target_audience === 'students') {
                // Assuming role names are consistent
                sql += " AND role_id = (SELECT id FROM roles WHERE name = 'STUDENT')";
            } else if (target_audience === 'professors') {
                sql += " AND role_id = (SELECT id FROM roles WHERE name = 'PROFESSOR')";
            } else if (target_audience === 'staff') {
                sql += " AND role_id IN (SELECT id FROM roles WHERE name IN ('RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'SUPER_ADMIN'))";
            }
            // 'everyone' falls through to select all users

            const result = await query(sql);
            recipient_ids = result.rows.map(u => u.id);
        }

        if (!title || !message || !recipient_ids || !Array.isArray(recipient_ids)) {
            return res.status(400).json({
                success: false,
                error: 'Please provide title, message, and either recipient_ids array or target_audience'
            });
        }

        const notifications = await Notification.createAnnouncement(
            title,
            message,
            recipient_ids,
            req.body.link
        );

        res.status(201).json({
            success: true,
            count: notifications.length,
            message: `Announcement sent to ${notifications.length} users`,
            data: notifications
        });
    } catch (err) {
        console.error('createAnnouncement error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
