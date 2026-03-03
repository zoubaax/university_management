const { query } = require('../config/db');

class StudyQuiz {
    static async create(data) {
        const { student_id, resource_id, quiz_data, score, total_questions } = data;
        const result = await query(
            `INSERT INTO study_quizzes (student_id, resource_id, quiz_data, score, total_questions)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [student_id, resource_id, quiz_data, score, total_questions]
        );
        return result.rows[0];
    }

    static async findByStudent(studentId) {
        const result = await query(
            `SELECT sq.*, cr.title as resource_title, m.name as module_name
             FROM study_quizzes sq
             JOIN course_resources cr ON sq.resource_id = cr.id
             JOIN modules m ON cr.module_id = m.id
             WHERE sq.student_id = $1
             ORDER BY sq.created_at DESC`,
            [studentId]
        );
        return result.rows;
    }

    // Initialize the table if it doesn't exist (simulating a migration)
    static async initTable() {
        await query(`
            CREATE TABLE IF NOT EXISTS study_quizzes (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                student_id UUID REFERENCES users(id) ON DELETE CASCADE,
                resource_id UUID REFERENCES course_resources(id) ON DELETE CASCADE,
                quiz_data JSONB NOT NULL,
                score INTEGER DEFAULT 0,
                total_questions INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }
}

module.exports = StudyQuiz;
