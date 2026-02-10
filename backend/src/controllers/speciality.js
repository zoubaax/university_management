const SpecialityService = require('../services/specialityService');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Get all specialities
// @route   GET /api/v1/specialities
// @access  Private
exports.getSpecialities = async (req, res, next) => {
    try {
        let specialities;
        const isDeptRole = req.user.role_name === 'RESPONSABLE_DEPARTMENT' || req.user.role_name === 'DIRECTOR_DEPARTMENT';

        if (req.query.departmentId) {
            // If they are dept role, they can only request their own department
            if (isDeptRole && req.query.departmentId !== req.user.department_id) {
                return next(new ErrorResponse('You are not authorized to access specialities from another department', 403));
            }
            specialities = await SpecialityService.getSpecialitiesByDepartment(req.query.departmentId);
        } else if (isDeptRole) {
            // Auto-filter for departmental roles
            specialities = await SpecialityService.getSpecialitiesByDepartment(req.user.department_id);
        } else {
            specialities = await SpecialityService.getAllSpecialities();
        }
        res.status(200).json({ success: true, count: specialities.length, data: specialities });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single speciality
// @route   GET /api/v1/specialities/:id
// @access  Private
exports.getSpeciality = async (req, res, next) => {
    try {
        const speciality = await SpecialityService.getSpecialityById(req.params.id);
        res.status(200).json({ success: true, data: speciality });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new speciality
// @route   POST /api/v1/specialities
// @access  Private/Admin
exports.createSpeciality = async (req, res, next) => {
    try {
        // Department Isolation
        const isDeptRole = req.user.role_name === 'RESPONSABLE_DEPARTMENT' || req.user.role_name === 'DIRECTOR_DEPARTMENT';
        if (isDeptRole && req.user.department_id !== req.body.department_id) {
            return next(new ErrorResponse('You are not authorized to add specialities to this department', 403));
        }

        const speciality = await SpecialityService.createSpeciality(req.body);
        res.status(201).json({ success: true, data: speciality });
    } catch (err) {
        next(err);
    }
};

// @desc    Update speciality
// @route   PUT /api/v1/specialities/:id
// @access  Private/Admin
exports.updateSpeciality = async (req, res, next) => {
    try {
        const speciality = await SpecialityService.getSpecialityById(req.params.id);

        // Department Isolation
        const isDeptRole = req.user.role_name === 'RESPONSABLE_DEPARTMENT' || req.user.role_name === 'DIRECTOR_DEPARTMENT';
        if (isDeptRole && req.user.department_id !== speciality.department_id) {
            return next(new ErrorResponse('You are not authorized to update specialities in this department', 403));
        }

        const updated = await SpecialityService.updateSpeciality(req.params.id, req.body);
        res.status(200).json({ success: true, data: updated });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete speciality
// @route   DELETE /api/v1/specialities/:id
// @access  Private/Admin
exports.deleteSpeciality = async (req, res, next) => {
    try {
        const speciality = await SpecialityService.getSpecialityById(req.params.id);

        // Department Isolation
        const isDeptRole = req.user.role_name === 'RESPONSABLE_DEPARTMENT' || req.user.role_name === 'DIRECTOR_DEPARTMENT';
        if (isDeptRole && req.user.department_id !== speciality.department_id) {
            return next(new ErrorResponse('You are not authorized to delete specialities in this department', 403));
        }

        await SpecialityService.deleteSpeciality(req.params.id);
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
