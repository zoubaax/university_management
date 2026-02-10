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

        return await Student.create({ ...studentData, user_id: newUser.id });
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
        return student;
    }

    static async deleteStudent(id, user) {
        const existingStudent = await this.getStudentById(id, user);
        const student = await Student.softDelete(id);
        return student;
    }
}

module.exports = StudentService;
