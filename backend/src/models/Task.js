const { query } = require('../config/db');

class Task {
    static async findAll(filters = {}) {
        const { assigned_to, category, status, priority, is_archived } = filters;
        let queryStr = `
            SELECT t.*, 
                   COALESCE(e.first_name, s.first_name) as assignee_first_name,
                   COALESCE(e.last_name, s.last_name) as assignee_last_name
            FROM tasks t
            LEFT JOIN users u ON t.assigned_to = u.id
            LEFT JOIN employees e ON u.id = e.user_id
            LEFT JOIN students s ON u.id = s.user_id
            WHERE 1=1
        `;
        const params = [];

        if (assigned_to) {
            params.push(assigned_to);
            queryStr += ` AND t.assigned_to = $${params.length}`;
        }
        if (category) {
            params.push(category);
            queryStr += ` AND t.category = $${params.length}`;
        }
        if (status) {
            params.push(status);
            queryStr += ` AND t.status = $${params.length}`;
        }
        if (priority) {
            params.push(priority);
            queryStr += ` AND t.priority = $${params.length}`;
        }
        if (is_archived !== undefined) {
            params.push(is_archived);
            queryStr += ` AND t.is_archived = $${params.length}`;
        }

        queryStr += ' ORDER BY t.due_date ASC, t.created_at DESC';

        const result = await query(queryStr, params);
        return result.rows;
    }

    static async findById(id) {
        const result = await query('SELECT * FROM tasks WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async create(data) {
        const { title, description, status, priority, category, due_date, assigned_to, created_by, related_entity_type, related_entity_id } = data;
        const result = await query(
            `INSERT INTO tasks (title, description, status, priority, category, due_date, assigned_to, created_by, related_entity_type, related_entity_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING *`,
            [title, description, status || 'TODO', priority || 'MEDIUM', category || 'PERSONAL', due_date, assigned_to, created_by, related_entity_type, related_entity_id]
        );
        return result.rows[0];
    }

    static async update(id, data) {
        const fields = Object.keys(data);
        const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
        const values = Object.values(data);
        values.push(id);

        const result = await query(
            `UPDATE tasks SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length} RETURNING *`,
            values
        );
        return result.rows[0];
    }

    static async delete(id) {
        await query('DELETE FROM tasks WHERE id = $1', [id]);
        return true;
    }

    static async getStats(userId) {
        const result = await query(
            `SELECT 
                COUNT(*) FILTER (WHERE status = 'TODO') as todo_count,
                COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') as in_progress_count,
                COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed_count,
                COUNT(*) FILTER (WHERE priority = 'HIGH' AND status != 'COMPLETED') as high_priority_count
             FROM tasks 
             WHERE assigned_to = $1 AND is_archived = FALSE`,
            [userId]
        );
        return result.rows[0];
    }
}

module.exports = Task;
