const CourseResource = require('../models/CourseResource');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Get all resources for a class
// @route   GET /api/v1/course-resources/class/:classId
exports.getClassResources = async (req, res, next) => {
    try {
        const resources = await CourseResource.findByClass(req.params.classId);
        res.status(200).json({
            success: true,
            count: resources.length,
            data: resources
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get resources uploaded by professor
// @route   GET /api/v1/course-resources/professor/:professorId
exports.getProfessorResources = async (req, res, next) => {
    try {
        const resources = await CourseResource.findByProfessor(req.params.professorId);
        res.status(200).json({
            success: true,
            count: resources.length,
            data: resources
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new course resource
// @route   POST /api/v1/course-resources
exports.createResource = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new ErrorResponse('Please upload a file', 400));
        }

        const resourceData = {
            ...req.body,
            professor_id: req.user.employee_id, // Linked to the logged-in professor
            file_path: `/uploads/resources/${req.file.filename}`,
            file_name: req.file.originalname,
            file_size: req.file.size
        };

        const resource = await CourseResource.create(resourceData);
        res.status(201).json({
            success: true,
            data: resource
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete resource
// @route   DELETE /api/v1/course-resources/:id
exports.deleteResource = async (req, res, next) => {
    try {
        const resource = await CourseResource.findById(req.params.id);
        if (!resource) {
            return next(new ErrorResponse('Resource not found', 404));
        }

        // Only the professor who uploaded it or admin can delete
        if (req.user.role_name !== 'SUPER_ADMIN' && resource.professor_id !== req.user.employee_id) {
            return next(new ErrorResponse('Not authorized to delete this resource', 403));
        }

        await CourseResource.delete(req.params.id);

        // Note: In a real app, you'd also delete the file from the filesystem here

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update resource info
// @route   PUT /api/v1/course-resources/:id
exports.updateResource = async (req, res, next) => {
    try {
        let resource = await CourseResource.findById(req.params.id);
        if (!resource) {
            return next(new ErrorResponse('Resource not found', 404));
        }

        if (req.user.role_name !== 'SUPER_ADMIN' && resource.professor_id !== req.user.employee_id) {
            return next(new ErrorResponse('Not authorized to update this resource', 403));
        }

        resource = await CourseResource.update(req.params.id, req.body);
        res.status(200).json({
            success: true,
            data: resource
        });
    } catch (err) {
        next(err);
    }
};
