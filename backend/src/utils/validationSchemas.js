const { z } = require('zod');

const departmentSchema = z.object({
    name: z.string().min(2).max(100),
    description: z.string().max(500).optional(),
});

const specialitySchema = z.object({
    department_id: z.string().uuid(),
    name: z.string().min(2).max(100),
});

module.exports = {
    departmentSchema,
    specialitySchema,
};
