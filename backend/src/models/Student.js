const { query } = require('../config/db');

class Student {
    static async findAll() {
        const result = await query(
            `    SELECT s.*, 
                 sp.name as speciality_name, 
                 d.name as department_name, 
                 u.email as user_email,
                 c.name as class_name
          FROM students s 
          JOIN specialities sp ON s.speciality_id = sp.id 
          JOIN departments d ON s.department_id = d.id 
          LEFT JOIN classes c ON s.class_id = c.id
          JOIN users u ON s.user_id = u.id 
          WHERE s.deleted_at IS NULL ORDER BY s.last_name ASC, s.first_name ASC`
        );
        return result.rows;
    }

    static async findByDepartment(departmentId) {
        const result = await query(
            `    SELECT s.*, 
                 sp.name as speciality_name, 
                 d.name as department_name, 
                 u.email as user_email,
                 c.name as class_name
          FROM students s 
          JOIN specialities sp ON s.speciality_id = sp.id 
          JOIN departments d ON s.department_id = d.id 
          LEFT JOIN classes c ON s.class_id = c.id
          JOIN users u ON s.user_id = u.id 
          WHERE s.department_id = $1 AND s.deleted_at IS NULL 
          ORDER BY s.last_name ASC, s.first_name ASC`,
            [departmentId]
        );
        return result.rows;
    }

    static async findById(id) {
        const result = await query(
            `    SELECT s.*, 
                 sp.name as speciality_name, 
                 d.name as department_name, 
                 u.email as user_email,
                 c.name as class_name
          FROM students s 
          JOIN specialities sp ON s.speciality_id = sp.id 
          JOIN departments d ON s.department_id = d.id 
          LEFT JOIN classes c ON s.class_id = c.id
          JOIN users u ON s.user_id = u.id 
          WHERE s.id = $1 AND s.deleted_at IS NULL`,
            [id]
        );
        return result.rows[0];
    }

    static async generateRegistrationNum() {
        const year = new Date().getFullYear();
        const prefix = `UPF-${year}-`;

        const result = await query(
            "SELECT registration_num FROM students WHERE registration_num LIKE $1 ORDER BY registration_num DESC LIMIT 1",
            [`${prefix}%`]
        );

        let nextNumber = 1;
        if (result.rows.length > 0) {
            const lastNum = result.rows[0].registration_num;
            const lastCounter = parseInt(lastNum.split('-')[2]);
            if (!isNaN(lastCounter)) {
                nextNumber = lastCounter + 1;
            }
        }

        return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
    }

    static async create(data) {
        let {
            user_id,
            department_id,
            speciality_id,
            class_id,
            registration_num,
            first_name,
            last_name,
            cin,
            birth_date,
            bac_document_url,
            cin_document_url
        } = data;

        // Auto-generate registration number if not provided
        if (!registration_num) {
            registration_num = await this.generateRegistrationNum();
        }

        const result = await query(
            `INSERT INTO students (
                user_id, department_id, speciality_id, class_id, 
                registration_num, first_name, last_name, cin, 
                birth_date, bac_document_url, cin_document_url
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
            RETURNING *`,
            [
                user_id, department_id, speciality_id, class_id,
                registration_num, first_name, last_name, cin,
                birth_date, bac_document_url, cin_document_url
            ]
        );
        return result.rows[0];
    }

    static async update(id, data) {
        const {
            department_id,
            speciality_id,
            class_id,
            registration_num,
            first_name,
            last_name,
            cin,
            birth_date,
            bac_document_url,
            cin_document_url
        } = data;

        const result = await query(
            `UPDATE students 
             SET department_id = COALESCE($1, department_id),
                 speciality_id = COALESCE($2, speciality_id),
                 class_id = COALESCE($3, class_id),
                 registration_num = COALESCE($4, registration_num),
                 first_name = COALESCE($5, first_name),
                 last_name = COALESCE($6, last_name),
                 cin = COALESCE($7, cin),
                 birth_date = COALESCE($8, birth_date),
                 bac_document_url = COALESCE($9, bac_document_url),
                 cin_document_url = COALESCE($10, cin_document_url),
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $11 AND deleted_at IS NULL 
             RETURNING *`,
            [
                department_id, speciality_id, class_id,
                registration_num, first_name, last_name, cin,
                birth_date, bac_document_url, cin_document_url,
                id
            ]
        );
        return result.rows[0];
    }

    static async softDelete(id) {
        const result = await query(
            'UPDATE students SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
            [id]
        );
        return result.rows[0];
    }
}

module.exports = Student;
