const { z } = require('zod');

const departmentSchema = z.object({
    name: z.string().min(2).max(100),
    description: z.string().max(500).optional(),
    yearly_price: z.union([z.number(), z.string()]).optional(),
});

const specialitySchema = z.object({
    department_id: z.string().uuid(),
    name: z.string().min(2).max(100),
    yearly_price: z.union([z.number(), z.string()]).optional(),
});

const employeeSchema = z.object({
    department_id: z.string().uuid().nullable().optional(),
    first_name: z.string().min(2).max(100),
    last_name: z.string().min(2).max(100),
    type: z.enum(['ADMINISTRATIVE', 'PROFESSOR', 'CLEANER', 'SECURITY', 'MAINTENANCE']),
    // These are optional if the employee has no login
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    role_id: z.string().uuid().nullable().optional(),
});

const studentSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).optional().or(z.literal('')),
    role_id: z.string().uuid(),
    department_id: z.string().uuid(),
    speciality_id: z.string().uuid(),
    class_id: z.string().uuid().optional().or(z.literal('')),
    partnership_id: z.string().uuid().optional().or(z.literal('')),
    registration_num: z.string().max(50).optional().or(z.literal('')),
    first_name: z.string().min(2).max(100),
    last_name: z.string().min(2).max(100),
    cin: z.string().min(4).max(50),
    birth_date: z.string().optional(),
});

const absenceSchema = z.object({
    employee_id: z.string().uuid(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    type: z.enum(['SICK', 'VACATION', 'UNEXCUSED', 'PAID_LEAVE', 'OTHER']),
    reason: z.string().max(500).optional().nullable(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'JUSTIFIED']).optional(),
});

const classSchema = z.object({
    speciality_id: z.string().uuid(),
    name: z.string().min(2).max(100),
    level: z.string().max(50).optional(),
    academic_year: z.string().min(4).max(20),
});

module.exports = {
    departmentSchema,
    specialitySchema,
    employeeSchema,
    studentSchema,
    absenceSchema,
    classSchema,
};
