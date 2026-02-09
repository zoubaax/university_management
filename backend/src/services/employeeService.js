const Employee = require('../models/Employee');
const User = require('../models/User');
const ErrorResponse = require('../utils/ErrorResponse');

class EmployeeService {
    static async getAllEmployees(filters = {}) {
        return await Employee.findAll(filters);
    }

    static async getEmployeeById(id) {
        const employee = await Employee.findById(id);
        if (!employee) {
            throw new ErrorResponse('Employee not found', 404);
        }
        return employee;
    }

    static async createEmployee(employeeData, userData = null) {
        let user_id = null;

        const NO_LOGIN_TYPES = ['CLEANER', 'SECURITY', 'MAINTENANCE'];

        // If account details provided (email/password), create user account first
        // BUT ONLY IF they are not in the NO_LOGIN_TYPES
        if (userData && userData.email && userData.password && !NO_LOGIN_TYPES.includes(employeeData.type)) {
            const existingUser = await User.findByEmail(userData.email);
            if (existingUser) {
                throw new ErrorResponse('User with this email already exists', 400);
            }

            const newUser = await User.create({
                email: userData.email,
                password: userData.password,
                role_id: userData.role_id,
                department_id: employeeData.department_id
            });
            user_id = newUser.id;
        }

        return await Employee.create({ ...employeeData, user_id });
    }

    static async updateEmployee(id, data) {
        const { email, password, role_id, ...employeeData } = data;

        const employee = await Employee.update(id, employeeData);
        if (!employee) {
            throw new ErrorResponse('Employee not found', 404);
        }

        // If employee has an associated user account, update it too if relevant fields changed
        if (employee.user_id && (email || password || role_id || employeeData.department_id)) {
            await User.update(employee.user_id, {
                email,
                password,
                role_id,
                department_id: employeeData.department_id
            });
        }

        return employee;
    }

    static async deleteEmployee(id) {
        const employee = await Employee.softDelete(id);
        if (!employee) {
            throw new ErrorResponse('Employee not found', 404);
        }
        return employee;
    }
}

module.exports = EmployeeService;
