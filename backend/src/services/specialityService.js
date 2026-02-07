const Speciality = require('../models/Speciality');
const ErrorResponse = require('../utils/ErrorResponse');

class SpecialityService {
    static async getAllSpecialities() {
        return await Speciality.findAll();
    }

    static async getSpecialityById(id) {
        const speciality = await Speciality.findById(id);
        if (!speciality) {
            throw new ErrorResponse('Speciality not found', 404);
        }
        return speciality;
    }

    static async getSpecialitiesByDepartment(departmentId) {
        return await Speciality.findByDepartment(departmentId);
    }

    static async createSpeciality(data) {
        return await Speciality.create(data);
    }

    static async updateSpeciality(id, data) {
        const speciality = await Speciality.update(id, data);
        if (!speciality) {
            throw new ErrorResponse('Speciality not found', 404);
        }
        return speciality;
    }

    static async deleteSpeciality(id) {
        const speciality = await Speciality.softDelete(id);
        if (!speciality) {
            throw new ErrorResponse('Speciality not found', 404);
        }
        return speciality;
    }
}

module.exports = SpecialityService;
