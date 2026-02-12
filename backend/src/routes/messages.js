const express = require('express');
const {
    getInbox,
    getSent,
    getMessage,
    sendMessage,
    markAsRead,
    toggleStar,
    deleteMessage,
    getUnreadCount,
    searchUsers
} = require('../controllers/messages');

const router = express.Router();
const { protect } = require('../middlewares/auth');

// All routes require authentication
router.use(protect);

// User search for recipient selection
router.get('/users/search', searchUsers);

// Unread count
router.get('/unread/count', getUnreadCount);

// Inbox and sent
router.get('/inbox', getInbox);
router.get('/sent', getSent);

// Single message operations
router.get('/:id', getMessage);
router.post('/', sendMessage);
router.put('/:id/read', markAsRead);
router.put('/:id/star', toggleStar);
router.delete('/:id', deleteMessage);

module.exports = router;
