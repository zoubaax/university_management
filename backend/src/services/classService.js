const Class = require('../models/Class');
const ErrorResponse = require('../utils/ErrorResponse');

class ClassService {
    static async getAllClasses(user) {
        // If user is Responsable de Departement, only return classes in their department
        if (user.role_name === 'RESPONSABLE_DEPARTMENT' || user.role_name === 'DIRECTOR_DEPARTMENT') {
            return await Class.findByDepartment(user.department_id);
        }
        return await Class.findAll();
    }

    static async getClassById(id, user) {
        const classObj = await Class.findById(id);
        if (!classObj) {
            throw new ErrorResponse('Class not found', 404);
        }

        // Access control for departmental roles
        if ((user.role_name === 'RESPONSABLE_DEPARTMENT' || user.role_name === 'DIRECTOR_DEPARTMENT') &&
            classObj.department_id !== user.department_id) {
            throw new ErrorResponse('Not authorized to access this class', 403);
        }

        return classObj;
    }

    static async createClass(data, user) {
        // If user is Responsable de Departement or Director, verify the speciality belongs to their department
        if (user.role_name === 'RESPONSABLE_DEPARTMENT' || user.role_name === 'DIRECTOR_DEPARTMENT') {
            const Speciality = require('../models/Speciality');
            const speciality = await Speciality.findById(data.speciality_id);
            if (!speciality || speciality.department_id !== user.department_id) {
                throw new ErrorResponse('You can only create classes for specialities within your department', 403);
            }
        }
        return await Class.create(data);
    }

    static async updateClass(id, data, user) {
        const existingClass = await this.getClassById(id, user);
        return await Class.update(id, data);
    }

    static async deleteClass(id, user) {
        const existingClass = await this.getClassById(id, user);
        return await Class.softDelete(id);
    }
}

module.exports = ClassService;
