const Task = require('../models/Task');

exports.getTasks = async (req, res) => {
    try {
        const filters = {
            assigned_to: req.user.id,
            ...req.query
        };
        // Admins can see all if they explicitly ask or for their own
        if (req.user.role_name === 'SUPER_ADMIN' && req.query.all === 'true') {
            delete filters.assigned_to;
        }

        const tasks = await Task.findAll(filters);
        res.status(200).json({
            success: true,
            data: tasks
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        res.status(200).json({ success: true, data: task });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createTask = async (req, res) => {
    try {
        const taskData = {
            ...req.body,
            created_by: req.user.id,
            assigned_to: req.body.assigned_to || req.user.id
        };
        const task = await Task.create(taskData);
        res.status(201).json({ success: true, data: task });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        let task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // Check ownership (only assigned user or creator or admin can update)
        if (task.assigned_to !== req.user.id && task.created_by !== req.user.id && req.user.role_name !== 'SUPER_ADMIN') {
            return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
        }

        task = await Task.update(req.params.id, req.body);
        res.status(200).json({ success: true, data: task });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        if (task.created_by !== req.user.id && req.user.role_name !== 'SUPER_ADMIN') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this task' });
        }

        await Task.delete(req.params.id);
        res.status(200).json({ success: true, message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getTaskStats = async (req, res) => {
    try {
        const stats = await Task.getStats(req.user.id);
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
