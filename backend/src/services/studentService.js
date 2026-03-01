const Student = require('../models/Student');
const User = require('../models/User');
const ErrorResponse = require('../utils/ErrorResponse');

class StudentService {
    static async getAllStudents(user) {
        if (user.role_name === 'RESPONSABLE_DEPARTMENT' || user.role_name === 'DIRECTOR_DEPARTMENT') {
            return await Student.findByDepartment(user.department_id);
        }
        return await Student.findAll();
    }

    static async getStudentById(id, user) {
        const student = await Student.findById(id);
        if (!student) {
            throw new ErrorResponse('Student not found', 404);
        }

        // Access control for departmental roles
        if ((user.role_name === 'RESPONSABLE_DEPARTMENT' || user.role_name === 'DIRECTOR_DEPARTMENT') &&
            student.department_id !== user.department_id) {
            throw new ErrorResponse('Not authorized to access this student', 403);
        }

        return student;
    }

    static async createStudent(studentData, userData, user) {
        // Isolation Check for Departmental Roles
        if ((user.role_name === 'RESPONSABLE_DEPARTMENT' || user.role_name === 'DIRECTOR_DEPARTMENT') &&
            studentData.department_id !== user.department_id) {
            throw new ErrorResponse('You can only create students for your own department', 403);
        }
        // Check if user exists
        const existingUser = await User.findByEmail(userData.email);
        if (existingUser) {
            throw new ErrorResponse('User with this email already exists', 400);
        }

        // Create user account first
        const newUser = await User.create({
            email: userData.email,
            password: userData.password,
            role_id: userData.role_id,
            department_id: studentData.department_id
        });

        const student = await Student.create({ ...studentData, user_id: newUser.id });

        // AUTO-FINANCE: Initialize finance profile automatically
        try {
            const Finance = require('../models/Finance');
            await Finance.updateFinanceProfile(student.id, 'MONTHLY', studentData.partnership_id || null);
        } catch (err) {
            console.error('⚠️ Failed to initialize finance profile for student:', student.id, err.message);
        }

        return student;
    }

    static async updateStudent(id, data, user) {
        // Find student first to check existence and department isolation
        const existingStudent = await this.getStudentById(id, user);

        // Isolation Check for Departmental Roles (if they try to move student to another dept)
        if ((user.role_name === 'RESPONSABLE_DEPARTMENT' || user.role_name === 'DIRECTOR_DEPARTMENT') &&
            data.department_id && data.department_id !== user.department_id) {
            throw new ErrorResponse('You cannot move a student to another department', 403);
        }

        // Update user if department_id changed
        if (data.department_id && data.department_id !== existingStudent.department_id) {
            await User.update(existingStudent.user_id, {
                department_id: data.department_id
            });
        }

        const student = await Student.update(id, data);

        // AUTO-FINANCE: If speciality or partnership changed, recalculate tuition
        const specialityChanged = data.speciality_id && data.speciality_id !== existingStudent.speciality_id;
        const partnershipChanged = data.partnership_id !== undefined && data.partnership_id !== existingStudent.partnership_id;

        if (specialityChanged || partnershipChanged) {
            try {
                const Finance = require('../models/Finance');
                // Get existing plan & partnership to maintain continuity
                const profiles = await Finance.getStudentProfiles({ studentId: id });
                const currentProfile = profiles.find(p => p.student_id === id);

                await Finance.updateFinanceProfile(
                    id,
                    currentProfile?.payment_plan || 'MONTHLY',
                    data.partnership_id !== undefined ? data.partnership_id : (currentProfile?.partnership_id || null)
                );
            } catch (err) {
                console.error('⚠️ Failed to sync finance profile after change:', err.message);
            }
        }

        return student;
    }

    static async deleteStudent(id, user) {
        const existingStudent = await this.getStudentById(id, user);
        const student = await Student.softDelete(id);
        return student;
    }
}

module.exports = StudentService;
