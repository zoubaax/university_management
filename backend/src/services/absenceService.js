const Absence = require('../models/Absence');
const ErrorResponse = require('../utils/ErrorResponse');

class AbsenceService {
    static async getAllAbsences() {
        return await Absence.findAll();
    }

    static async getAbsenceById(id) {
        const absence = await Absence.findById(id);
        if (!absence) {
            throw new ErrorResponse('Absence record not found', 404);
        }
        return absence;
    }

    static async getEmployeeAbsences(employeeId) {
        return await Absence.findByEmployee(employeeId);
    }

    static async createAbsence(data) {
        return await Absence.create(data);
    }

    static async updateAbsence(id, data) {
        const absence = await Absence.update(id, data);
        if (!absence) {
            throw new ErrorResponse('Absence record not found', 404);
        }
        return absence;
    }

    static async deleteAbsence(id) {
        const absence = await Absence.softDelete(id);
        if (!absence) {
            throw new ErrorResponse('Absence record not found', 404);
        }
        return absence;
    }
}

module.exports = AbsenceService;
