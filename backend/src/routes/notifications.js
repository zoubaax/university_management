const express = require('express');
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createAnnouncement
} = require('../controllers/notifications');

const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');

// All routes require authentication
router.use(protect);

// Unread count
router.get('/unread/count', getUnreadCount);

// Mark all as read
router.put('/read-all', markAllAsRead);

// Get notifications
router.get('/', getNotifications);

// Single notification operations
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

// Admin: Create announcement
router.post('/announcement', authorize('SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT'), createAnnouncement);

module.exports = router;
