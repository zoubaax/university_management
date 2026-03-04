const Club = require('../models/Club');
const ClubMember = require('../models/ClubMember');
const ClubEvent = require('../models/ClubEvent');
const AppError = require('../utils/ErrorResponse');
const logger = require('../utils/logger');

// @desc    Get all clubs
// @route   GET /api/v1/clubs
// @access  Public / Private
exports.getClubs = async (req, res, next) => {
    try {
        const clubs = await Club.findAll();

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
            logo_url = `/${req.file.path.replace(/\\/g, '/')}`;
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
