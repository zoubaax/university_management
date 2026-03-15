const Club = require('../models/Club');
const ClubMember = require('../models/ClubMember');
const ClubEvent = require('../models/ClubEvent');
const ClubBroadcast = require('../models/ClubBroadcast');
const ClubGallery = require('../models/ClubGallery');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const AppError = require('../utils/ErrorResponse');
const logger = require('../utils/logger');

// @desc    Get all clubs
// @route   GET /api/v1/clubs
// @access  Public / Private
exports.getClubs = async (req, res, next) => {
    try {
        const userId = req.user ? req.user.id : null;
        const clubs = await Club.findAll(userId);

        res.status(200).json({
            success: true,
            count: clubs.length,
            data: clubs
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get a single club
// @route   GET /api/v1/clubs/:id
// @access  Public / Private
exports.getClub = async (req, res, next) => {
    try {
        const club = await Club.findById(req.params.id);

        if (!club) {
            return next(new AppError('Club not found', 404));
        }

        res.status(200).json({
            success: true,
            data: club
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get club details for logged-in Club President
// @route   GET /api/v1/clubs/me/profile
// @access  Private (Club President only)
exports.getMyClub = async (req, res, next) => {
    try {
        if (req.user.role_name !== 'CLUB_PRESIDENT') {
            return next(new AppError('Only Club Presidents can access this route', 403));
        }

        const club = await Club.findByUserId(req.user.id);
        if (!club) {
            return next(new AppError('No club associated with your account', 404));
        }

        res.status(200).json({
            success: true,
            data: club
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create a new club (Generates Account and Profile)
// @route   POST /api/v1/clubs
// @access  Private (Responsable Department / Super Admin)
exports.createClub = async (req, res, next) => {
    try {
        const { name, email, password, description, department_id, category } = req.body;

        // Validations
        if (!name || !email || !password || !department_id) {
            return next(new AppError('Please provide all required fields: name, email, password, department_id', 400));
        }

        if (password.length < 6) {
            return next(new AppError('Password must be at least 6 characters', 400));
        }

        // Build the logo URL from the uploaded file (if any)
        let logo_url = null;
        if (req.file) {
            logo_url = req.file.path;
        }

        const newClub = await Club.create({
            name,
            email,
            password,
            description,
            department_id,
            logo_url,
            category
        });

        logger.info(`New club created: ${newClub.name} (ID: ${newClub.id}) by User: ${req.user.id}`);

        res.status(201).json({
            success: true,
            message: 'Club and Club President account created successfully',
            data: newClub
        });
    } catch (err) {
        if (err.code === '23505' && err.constraint === 'users_email_key') {
            return next(new AppError('A user/club with that email already exists', 400));
        }
        next(err);
    }
};

// @desc    Update a club
// @route   PUT /api/v1/clubs/:id
// @access  Private (Club President, Super Admin)
exports.updateClub = async (req, res, next) => {
    try {
        const club = await Club.findById(req.params.id);

        if (!club) {
            return next(new AppError('Club not found', 404));
        }

        if (req.user.role_name !== 'SUPER_ADMIN' && req.user.id !== club.user_id) {
            return next(new AppError('Not authorized to update this club', 403));
        }

        const updatedClub = await Club.update(req.params.id, req.body);

        res.status(200).json({
            success: true,
            data: updatedClub
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete a club
// @route   DELETE /api/v1/clubs/:id
// @access  Private (Responsable Department / Super Admin)
exports.deleteClub = async (req, res, next) => {
    try {
        const result = await Club.delete(req.params.id);

        if (!result) {
            return next(new AppError('Club not found', 404));
        }

        logger.info(`Club deleted (ID: ${req.params.id}) by User: ${req.user.id}`);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};

// --- Member Management ---

// @desc    Get club members
// @route   GET /api/v1/clubs/:id/members
exports.getClubMembers = async (req, res, next) => {
    try {
        const members = await ClubMember.findByClubId(req.params.id);
        res.status(200).json({ success: true, count: members.length, data: members });
    } catch (err) {
        next(err);
    }
};

// @desc    Update member status
// @route   PATCH /api/v1/clubs/:id/members/:studentUserId
exports.updateMemberStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const member = await ClubMember.updateStatus(req.params.id, req.params.studentUserId, status);
        res.status(200).json({ success: true, data: member });
    } catch (err) {
        next(err);
    }
};

// @desc    Update member role
// @route   PATCH /api/v1/clubs/:id/members/:studentUserId/role
exports.updateMemberRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        const member = await ClubMember.updateRole(req.params.id, req.params.studentUserId, role);
        res.status(200).json({ success: true, data: member });
    } catch (err) {
        next(err);
    }
};

// @desc    Join a club
// @route   POST /api/v1/clubs/:id/join
exports.joinClub = async (req, res, next) => {
    try {
        const member = await ClubMember.addMember(req.params.id, req.user.id);
        res.status(201).json({ success: true, data: member });
    } catch (err) {
        next(err);
    }
};

// --- Event Management ---

// @desc    Get club events
// @route   GET /api/v1/clubs/:id/events
exports.getClubEvents = async (req, res, next) => {
    try {
        const events = await ClubEvent.findByClubId(req.params.id);
        res.status(200).json({ success: true, count: events.length, data: events });
    } catch (err) {
        next(err);
    }
};

// @desc    Create club event
// @route   POST /api/v1/clubs/:id/events
exports.createClubEvent = async (req, res, next) => {
    try {
        const eventData = { ...req.body, club_id: req.params.id };
        const event = await ClubEvent.create(eventData);
        res.status(201).json({ success: true, data: event });
    } catch (err) {
        next(err);
    }
};

// @desc    Update club event
// @route   PUT /api/v1/clubs/:id/events/:eventId
exports.updateClubEvent = async (req, res, next) => {
    try {
        const event = await ClubEvent.update(req.params.eventId, req.body);
        res.status(200).json({ success: true, data: event });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete club event
// @route   DELETE /api/v1/clubs/:id/events/:eventId
exports.deleteClubEvent = async (req, res, next) => {
    try {
        await ClubEvent.delete(req.params.eventId);
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};

// @desc    RSVP to club event
// @route   POST /api/v1/clubs/events/:id/rsvp
exports.rsvpEvent = async (req, res, next) => {
    try {
        const rsvp = await ClubEvent.rsvp(req.params.id, req.user.id);
        res.status(201).json({ success: true, data: rsvp });
    } catch (err) {
        next(err);
    }
};

// @desc    Get RSVPs for club event
// @route   GET /api/v1/clubs/events/:id/rsvps
exports.getEventRSVPs = async (req, res, next) => {
    try {
        const rsvps = await ClubEvent.getRSVPs(req.params.id);
        res.status(200).json({ success: true, data: rsvps });
    } catch (err) {
        next(err);
    }
};

// @desc    Broadcast message to all club members
// @route   POST /api/v1/clubs/:id/broadcast
// @access  Private (Club President only)
exports.broadcastMessage = async (req, res, next) => {
    try {
        const { subject, body } = req.body;
        const clubId = req.params.id;

        if (!subject || !body) {
            return next(new AppError('Please provide subject and body', 400));
        }

        const club = await Club.findById(clubId);
        if (!club) {
            return next(new AppError('Club not found', 404));
        }

        // Verify ownership
        if (req.user.role_name !== 'SUPER_ADMIN' && req.user.id !== club.user_id) {
            return next(new AppError('Not authorized to broadcast from this club', 403));
        }

        const members = await ClubMember.findApprovedMembers(clubId);

        if (members.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No approved members to broadcast to'
            });
        }

        // Send messages and notifications in parallel
        const broadcastPromises = members.map(async (member) => {
            // Create message
            const message = await Message.create({
                sender_id: club.user_id,
                sender_type: 'user', // Club sender type
                recipient_id: member.student_user_id,
                recipient_type: 'user', // Fixed as 'user' for student-user-id routing in our messaging fix
                subject: `[BROADCAST] ${subject}`,
                body
            });

            // Create notification
            await Notification.create({
                user_id: member.student_user_id,
                type: 'general',
                title: `New Broadcast: ${club.name}`,
                message: subject,
                link: '/messages',
                related_id: message.id
            });
        });

        await Promise.all(broadcastPromises);

        // --- NEW: Save the broadcast record for history ---
        await ClubBroadcast.create({
            club_id: clubId,
            sender_id: req.user.id,
            subject,
            body
        });

        logger.info(`Broadcast sent from club ${club.name} (ID: ${club.id}) to ${members.length} members`);

        res.status(200).json({
            success: true,
            message: `Message broadcasted to ${members.length} members`
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get club broadcasts
// @route   GET /api/v1/clubs/:id/broadcasts
exports.getClubBroadcasts = async (req, res, next) => {
    try {
        const broadcasts = await ClubBroadcast.findByClubId(req.params.id);
        res.status(200).json({
            success: true,
            count: broadcasts.length,
            data: broadcasts
        });
    } catch (err) {
        next(err);
    }
};

// --- Gallery Management ---

// @desc    Get club gallery photos
// @route   GET /api/v1/clubs/:id/gallery
exports.getClubGallery = async (req, res, next) => {
    try {
        const photos = await ClubGallery.findByClubId(req.params.id);
        res.status(200).json({ success: true, data: photos });
    } catch (err) {
        next(err);
    }
};

// @desc    Add photo to club gallery
// @route   POST /api/v1/clubs/:id/gallery
exports.addClubGalleryItem = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new AppError('Please upload an image', 400));
        }

        const photo = await ClubGallery.create({
            club_id: req.params.id,
            image_url: req.file.path,
            caption: req.body.caption
        });

        res.status(201).json({ success: true, data: photo });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete photo from club gallery
// @route   DELETE /api/v1/clubs/:id/gallery/:photoId
exports.deleteClubGalleryItem = async (req, res, next) => {
    try {
        await ClubGallery.delete(req.params.photoId);
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
