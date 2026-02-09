const Student = require('../models/Student');
const User = require('../models/User');
const ErrorResponse = require('../utils/ErrorResponse');

class StudentService {
    static async getAllStudents() {
        return await Student.findAll();
    }

    static async getStudentById(id) {
        const student = await Student.findById(id);
        if (!student) {
            throw new ErrorResponse('Student not found', 404);
        }
        return student;
    }

    static async createStudent(studentData, userData) {
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

    static async updateStudent(id, data) {
        // Find student first to check existence
        const existingStudent = await Student.findById(id);
        if (!existingStudent) {
            throw new ErrorResponse('Student not found', 404);
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

    static async deleteStudent(id) {
        const student = await Student.softDelete(id);
        if (!student) {
            throw new ErrorResponse('Student not found', 404);
        }
        return student;
    }
}

module.exports = StudentService;
