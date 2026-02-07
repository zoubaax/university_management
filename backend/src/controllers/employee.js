const EmployeeService = require('../services/employeeService');

// @desc    Get all employees
// @route   GET /api/v1/employees
// @access  Private/Admin
exports.getEmployees = async (req, res, next) => {
    try {
        const employees = await EmployeeService.getAllEmployees();
        res.status(200).json({ success: true, count: employees.length, data: employees });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single employee
// @route   GET /api/v1/employees/:id
// @access  Private/Admin
exports.getEmployee = async (req, res, next) => {
    try {
        const employee = await EmployeeService.getEmployeeById(req.params.id);
        res.status(200).json({ success: true, data: employee });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new employee
// @route   POST /api/v1/employees
// @access  Private/Admin
exports.createEmployee = async (req, res, next) => {
    try {
        const { email, password, role_id, ...employeeData } = req.body;
        let userData = null;

        if (email && password) {
            userData = { email, password, role_id };
        }

        const employee = await EmployeeService.createEmployee(employeeData, userData);
        res.status(201).json({ success: true, data: employee });
    } catch (err) {
        next(err);
    }
};

// @desc    Update employee
// @route   PUT /api/v1/employees/:id
// @access  Private/Admin
exports.updateEmployee = async (req, res, next) => {
    try {
        const employee = await EmployeeService.updateEmployee(req.params.id, req.body);
        res.status(200).json({ success: true, data: employee });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete employee
// @route   DELETE /api/v1/employees/:id
// @access  Private/Admin
exports.deleteEmployee = async (req, res, next) => {
    try {
        await EmployeeService.deleteEmployee(req.params.id);
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
