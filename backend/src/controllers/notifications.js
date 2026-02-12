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
        const { title, message, recipient_ids, link } = req.body;

        if (!title || !message || !recipient_ids || !Array.isArray(recipient_ids)) {
            return res.status(400).json({
                success: false,
                error: 'Please provide title, message, and recipient_ids array'
            });
        }

        const notifications = await Notification.createAnnouncement(
            title,
            message,
            recipient_ids,
            link
        );

        res.status(201).json({
            success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (err) {
        console.error('createAnnouncement error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
