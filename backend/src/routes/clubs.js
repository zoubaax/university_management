const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const {
    getClubs,
    getClub,
    getMyClub,
    createClub,
    updateClub,
    deleteClub,
    getClubMembers,
    updateMemberStatus,
    joinClub,
    getClubEvents,
    createClubEvent,
    rsvpEvent
} = require('../controllers/clubs');

// Public route to view all clubs
router.get('/', getClubs);

// Private route for Club President to see their own club profile
// Defined before /:id to avoid conflict
router.get('/me/profile', protect, authorize('CLUB_PRESIDENT'), getMyClub);

// Public route to view a specific club
router.get('/:id', getClub);

// Club Creation (Super Admin / Responsable)
router.post('/', protect, authorize('SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT'), upload.single('club_logo'), createClub);

// Update/Delete club
router.put('/:id', protect, authorize('SUPER_ADMIN', 'CLUB_PRESIDENT'), updateClub);
router.delete('/:id', protect, authorize('SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT'), deleteClub);

// --- Member Management ---
router.get('/:id/members', protect, getClubMembers);
router.patch('/:id/members/:studentUserId', protect, authorize('CLUB_PRESIDENT', 'SUPER_ADMIN'), updateMemberStatus);
router.post('/:id/join', protect, authorize('STUDENT'), joinClub);

// --- Event Management ---
router.get('/:id/events', protect, getClubEvents);
router.post('/:id/events', protect, authorize('CLUB_PRESIDENT', 'SUPER_ADMIN'), createClubEvent);
router.post('/events/:id/rsvp', protect, authorize('STUDENT'), rsvpEvent);

module.exports = router;
