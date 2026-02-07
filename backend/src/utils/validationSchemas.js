const { z } = require('zod');

const departmentSchema = z.object({
    name: z.string().min(2).max(100),
    description: z.string().max(500).optional(),
});

const specialitySchema = z.object({
    department_id: z.string().uuid(),
    name: z.string().min(2).max(100),
});

const employeeSchema = z.object({
    department_id: z.string().uuid(),
    first_name: z.string().min(2).max(100),
    last_name: z.string().min(2).max(100),
    type: z.enum(['ADMINISTRATIVE', 'PROFESSOR', 'CLEANER', 'SECURITY', 'MAINTENANCE']),
    // These are optional if the employee has no login
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    role_id: z.string().uuid().optional(),
});

const studentSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    role_id: z.string().uuid(), // Student role ID
    speciality_id: z.string().uuid(),
    registration_num: z.string().min(5).max(50),
    birth_date: z.string().optional(),
});

module.exports = {
    departmentSchema,
    specialitySchema,
    employeeSchema,
    studentSchema,
};
