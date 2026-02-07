const SpecialityService = require('../services/specialityService');

// @desc    Get all specialities
// @route   GET /api/v1/specialities
// @access  Private
exports.getSpecialities = async (req, res, next) => {
    try {
        let specialities;
        if (req.query.departmentId) {
            specialities = await SpecialityService.getSpecialitiesByDepartment(req.query.departmentId);
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
        const speciality = await SpecialityService.updateSpeciality(req.params.id, req.body);
        res.status(200).json({ success: true, data: speciality });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete speciality
// @route   DELETE /api/v1/specialities/:id
// @access  Private/Admin
exports.deleteSpeciality = async (req, res, next) => {
    try {
        await SpecialityService.deleteSpeciality(req.params.id);
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
