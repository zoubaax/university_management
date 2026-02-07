const { query } = require('../config/db');

class Student {
    static async findAll() {
        const result = await query(
            `SELECT s.*, sp.name as speciality_name, d.name as department_name, u.email as user_email 
       FROM students s 
       JOIN specialities sp ON s.speciality_id = sp.id 
       JOIN departments d ON sp.department_id = d.id 
       JOIN users u ON s.user_id = u.id 
       WHERE s.deleted_at IS NULL ORDER BY u.email ASC`
        );
        return result.rows;
    }

    static async findById(id) {
        const result = await query(
            `SELECT s.*, sp.name as speciality_name, d.name as department_name, u.email as user_email 
       FROM students s 
       JOIN specialities sp ON s.speciality_id = sp.id 
       JOIN departments d ON sp.department_id = d.id 
       JOIN users u ON s.user_id = u.id 
       WHERE s.id = $1 AND s.deleted_at IS NULL`,
            [id]
        );
        return result.rows[0];
    }

    static async create(data) {
        const { user_id, speciality_id, registration_num, birth_date } = data;
        const result = await query(
            `INSERT INTO students (user_id, speciality_id, registration_num, birth_date) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
            [user_id, speciality_id, registration_num, birth_date]
        );
        return result.rows[0];
    }

    static async update(id, data) {
        const { speciality_id, registration_num, birth_date } = data;
        const result = await query(
            `UPDATE students 
       SET speciality_id = $1, registration_num = $2, birth_date = $3, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4 AND deleted_at IS NULL 
       RETURNING *`,
            [speciality_id, registration_num, birth_date, id]
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
