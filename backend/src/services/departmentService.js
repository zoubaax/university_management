const Department = require('../models/Department');
const ErrorResponse = require('../utils/ErrorResponse');

class DepartmentService {
    static async getAllDepartments() {
        return await Department.findAll();
    }

    static async getDepartmentById(id) {
        const department = await Department.findById(id);
        if (!department) {
            throw new ErrorResponse('Department not found', 404);
        }
        return department;
    }

    static async createDepartment(data) {
        return await Department.create(data);
    }

    static async updateDepartment(id, data) {
        const department = await Department.update(id, data);
        if (!department) {
            throw new ErrorResponse('Department not found', 404);
        }
        return department;
    }

    static async deleteDepartment(id) {
        const department = await Department.softDelete(id);
        if (!department) {
            throw new ErrorResponse('Department not found', 404);
        }
        return department;
    }
}

module.exports = DepartmentService;
