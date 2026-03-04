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
    updateClubEvent,
    deleteClubEvent,
    rsvpEvent,
    getEventRSVPs,
    broadcastMessage,
    getClubBroadcasts,
    updateMemberRole,
    getClubGallery,
    addClubGalleryItem,
    deleteClubGalleryItem
} = require('../controllers/clubs');

// Private route to view all clubs
router.get('/', protect, getClubs);

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
router.patch('/:id/members/:studentUserId/role', protect, authorize('CLUB_PRESIDENT', 'SUPER_ADMIN'), updateMemberRole);
router.post('/:id/join', protect, authorize('STUDENT'), joinClub);

// --- Event Management ---
router.get('/:id/events', protect, getClubEvents);
router.post('/:id/events', protect, authorize('CLUB_PRESIDENT', 'SUPER_ADMIN'), createClubEvent);
router.put('/:id/events/:eventId', protect, authorize('CLUB_PRESIDENT', 'SUPER_ADMIN'), updateClubEvent);
router.delete('/:id/events/:eventId', protect, authorize('CLUB_PRESIDENT', 'SUPER_ADMIN'), deleteClubEvent);
router.post('/events/:id/rsvp', protect, authorize('STUDENT'), rsvpEvent);
router.get('/events/:id/rsvps', protect, authorize('CLUB_PRESIDENT', 'SUPER_ADMIN'), getEventRSVPs);
router.post('/:id/broadcast', protect, authorize('CLUB_PRESIDENT', 'SUPER_ADMIN'), broadcastMessage);
router.get('/:id/broadcasts', protect, getClubBroadcasts);

// --- Gallery ---
router.get('/:id/gallery', protect, getClubGallery);
router.post('/:id/gallery', protect, authorize('CLUB_PRESIDENT', 'SUPER_ADMIN'), upload.single('image'), addClubGalleryItem);
router.delete('/:id/gallery/:photoId', protect, authorize('CLUB_PRESIDENT', 'SUPER_ADMIN'), deleteClubGalleryItem);

module.exports = router;
