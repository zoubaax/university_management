const Message = require('../models/Message');

// @desc    Get inbox messages
// @route   GET /api/v1/messages/inbox
// @access  Private
exports.getInbox = async (req, res) => {
    try {
        const userId = (req.user.role_name === 'STUDENT' ? req.user.student_id : req.user.employee_id) || req.user.id;
        const userType = req.user.role_name === 'STUDENT' ? 'student' : 'employee';

        console.log('User info:', {
            role: req.user.role_name,
            userId,
            userType,
            employee_id: req.user.employee_id,
            student_id: req.user.student_id,
            id: req.user.id
        });

        const { limit, offset, unreadOnly } = req.query;

        const messages = await Message.getInbox(userId, userType, {
            limit: parseInt(limit) || 50,
            offset: parseInt(offset) || 0,
            unreadOnly: unreadOnly === 'true'
        });

        res.status(200).json({
            success: true,
            count: messages.length,
            data: messages
        });
    } catch (err) {
        console.error('getInbox error:', err);
        console.error('Error stack:', err.stack);
        console.error('Error message:', err.message);
        res.status(500).json({ success: false, error: 'Server Error', details: err.message });
    }
};

// @desc    Get sent messages
// @route   GET /api/v1/messages/sent
// @access  Private
exports.getSent = async (req, res) => {
    try {
        const userId = req.user.role_name === 'STUDENT' ? req.user.student_id : req.user.employee_id;
        const userType = req.user.role_name === 'STUDENT' ? 'student' : 'employee';
        const { limit, offset } = req.query;

        const messages = await Message.getSent(userId, userType, {
            limit: parseInt(limit) || 50,
            offset: parseInt(offset) || 0
        });

        res.status(200).json({
            success: true,
            count: messages.length,
            data: messages
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get single message
// @route   GET /api/v1/messages/:id
// @access  Private
exports.getMessage = async (req, res) => {
    try {
        const userId = (req.user.role_name === 'STUDENT' ? req.user.student_id : req.user.employee_id) || req.user.id;
        const userType = req.user.role_name === 'STUDENT' ? 'student' : 'employee';
        const { id } = req.params;

        const message = await Message.findById(id, userId, userType);

        if (!message) {
            return res.status(404).json({ success: false, error: 'Message not found' });
        }

        // Auto-mark as read if recipient is viewing
        if (message.recipient_id === userId && message.recipient_type === userType && !message.is_read) {
            await Message.markAsRead(id, userId, userType);
            message.is_read = true;
            message.read_at = new Date();
        }

        res.status(200).json({
            success: true,
            data: message
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Send a message
// @route   POST /api/v1/messages
// @access  Private
exports.sendMessage = async (req, res) => {
    try {
        const senderId = (req.user.role_name === 'STUDENT' ? req.user.student_id : req.user.employee_id) || req.user.id;
        const senderType = req.user.role_name === 'STUDENT' ? 'student' : 'employee';
        const { recipient_id, recipient_type, subject, body } = req.body;

        // Validation
        if (!recipient_id || !recipient_type || !subject || !body) {
            return res.status(400).json({
                success: false,
                error: 'Please provide recipient_id, recipient_type, subject, and body'
            });
        }

        if (!['employee', 'student'].includes(recipient_type)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid recipient_type. Must be "employee" or "student"'
            });
        }

        const message = await Message.create({
            sender_id: senderId,
            sender_type: senderType,
            recipient_id,
            recipient_type,
            subject,
            body
        });

        // Create a system notification for the recipient
        // We use 'general' type since 'new_message' wasn't in our initial enum list
        // but it works perfectly for this purpose
        const Notification = require('../models/Notification');
        const { query } = require('../config/db');

        const senderName = req.user.first_name ? `${req.user.first_name} ${req.user.last_name}` : req.user.email;

        // Look up the actual User ID for the notification because recipient_id is student/employee ID
        let recipientUserId = null;
        if (recipient_type === 'student') {
            const res = await query('SELECT user_id FROM students WHERE id = $1', [recipient_id]);
            recipientUserId = res.rows[0]?.user_id;
        } else if (recipient_type === 'employee') {
            const res = await query('SELECT user_id FROM employees WHERE id = $1', [recipient_id]);
            recipientUserId = res.rows[0]?.user_id;
        }

        if (recipientUserId) {
            await Notification.create({
                user_id: recipientUserId,
                type: 'general',
                title: `New Message from ${senderName}`,
                message: subject.length > 50 ? subject.substring(0, 47) + '...' : subject,
                link: '/messages',
                related_id: message.id
            });
        }

        res.status(201).json({
            success: true,
            data: message
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Mark message as read
// @route   PUT /api/v1/messages/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
    try {
        const userId = (req.user.role_name === 'STUDENT' ? req.user.student_id : req.user.employee_id) || req.user.id;
        const userType = req.user.role_name === 'STUDENT' ? 'student' : 'employee';
        const { id } = req.params;

        const message = await Message.markAsRead(id, userId, userType);

        if (!message) {
            return res.status(404).json({ success: false, error: 'Message not found or already read' });
        }

        res.status(200).json({
            success: true,
            data: message
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Toggle star on message
// @route   PUT /api/v1/messages/:id/star
// @access  Private
exports.toggleStar = async (req, res) => {
    try {
        const userId = (req.user.role_name === 'STUDENT' ? req.user.student_id : req.user.employee_id) || req.user.id;
        const userType = req.user.role_name === 'STUDENT' ? 'student' : 'employee';
        const { id } = req.params;

        const message = await Message.toggleStar(id, userId, userType);

        if (!message) {
            return res.status(404).json({ success: false, error: 'Message not found' });
        }

        res.status(200).json({
            success: true,
            data: message
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Delete message
// @route   DELETE /api/v1/messages/:id
// @access  Private
exports.deleteMessage = async (req, res) => {
    try {
        const userId = (req.user.role_name === 'STUDENT' ? req.user.student_id : req.user.employee_id) || req.user.id;
        const userType = req.user.role_name === 'STUDENT' ? 'student' : 'employee';
        const { id } = req.params;

        const message = await Message.delete(id, userId, userType);

        if (!message) {
            return res.status(404).json({ success: false, error: 'Message not found' });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Get unread message count
// @route   GET /api/v1/messages/unread/count
// @access  Private
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = (req.user.role_name === 'STUDENT' ? req.user.student_id : req.user.employee_id) || req.user.id;
        const userType = req.user.role_name === 'STUDENT' ? 'student' : 'employee';

        if (!userId) {
            return res.status(200).json({
                success: true,
                data: { count: 0 }
            });
        }

        const count = await Message.getUnreadCount(userId, userType);

        res.status(200).json({
            success: true,
            data: { count }
        });
    } catch (err) {
        console.error('getUnreadCount error:', err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Search users for recipient selection
// @route   GET /api/v1/messages/users/search
// @access  Private
exports.searchUsers = async (req, res) => {
    try {
        const { q, limit } = req.query;

        if (!q || q.length < 2) {
            return res.status(400).json({
                success: false,
                error: 'Search query must be at least 2 characters'
            });
        }

        const users = await Message.searchUsers(q, parseInt(limit) || 20);

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
