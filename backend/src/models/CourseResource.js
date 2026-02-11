const { query } = require('../config/db');

class CourseResource {
    static async create(data) {
        const { class_id, module_id, professor_id, type, title, description, file_path, file_name, file_size } = data;
        const result = await query(
            `INSERT INTO course_resources (class_id, module_id, professor_id, type, title, description, file_path, file_name, file_size)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *`,
            [class_id, module_id, professor_id, type || 'COURSE', title, description, file_path, file_name, file_size]
        );
        return result.rows[0];
    }

    static async findByClass(classId) {
        const result = await query(
            `    SELECT cr.*, m.name as module_name, m.code as module_code, e.first_name as professor_first_name, e.last_name as professor_last_name
                 FROM course_resources cr
                 JOIN modules m ON cr.module_id = m.id
                 JOIN employees e ON cr.professor_id = e.id
                 WHERE cr.class_id = $1
                 ORDER BY cr.created_at DESC`,
            [classId]
        );
        return result.rows;
    }

    static async findByProfessor(professorId) {
        const result = await query(
            `    SELECT cr.*, c.name as class_name, m.name as module_name, m.code as module_code
                 FROM course_resources cr
                 JOIN classes c ON cr.class_id = c.id
                 JOIN modules m ON cr.module_id = m.id
                 WHERE cr.professor_id = $1
                 ORDER BY cr.created_at DESC`,
            [professorId]
        );
        return result.rows;
    }

    static async findById(id) {
        const result = await query(
            'SELECT * FROM course_resources WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        const result = await query(
            'DELETE FROM course_resources WHERE id = $1 RETURNING id',
            [id]
        );
        return result.rows[0];
    }

    static async update(id, data) {
        const { title, description } = data;
        const result = await query(
            `UPDATE course_resources 
             SET title = COALESCE($1, title),
                 description = COALESCE($2, description),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $3
             RETURNING *`,
            [title, description, id]
        );
        return result.rows[0];
    }
}

module.exports = CourseResource;
