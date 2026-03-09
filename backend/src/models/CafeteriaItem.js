const { query } = require('../config/db');

class CafeteriaItem {
    static async findAll(filters = {}) {
        const { category, is_available } = filters;
        let queryStr = 'SELECT * FROM cafeteria_items WHERE 1=1';
        const params = [];

        if (category) {
            params.push(category);
            queryStr += ` AND category = $${params.length}`;
        }
        if (is_available !== undefined) {
            params.push(is_available);
            queryStr += ` AND is_available = $${params.length}`;
        }

        queryStr += ' ORDER BY category ASC, name ASC';

        const result = await query(queryStr, params);
        return result.rows;
    }

    static async findById(id) {
        const result = await query('SELECT * FROM cafeteria_items WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async create(data) {
        const { name, description, price, category, image_url, is_available } = data;
        const result = await query(
            `INSERT INTO cafeteria_items (name, description, price, category, image_url, is_available)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [name, description, price, category, image_url, is_available !== undefined ? is_available : true]
        );
        return result.rows[0];
    }

    static async update(id, data) {
        const fields = Object.keys(data).filter(f => !['id', 'created_at', 'updated_at'].includes(f));
        if (fields.length === 0) return null;

        const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
        const values = fields.map(field => data[field]);
        values.push(id);

        const result = await query(
            `UPDATE cafeteria_items SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $${values.length} RETURNING *`,
            values
        );
        return result.rows[0];
    }

    static async delete(id) {
        await query('DELETE FROM cafeteria_items WHERE id = $1', [id]);
        return true;
    }

    static async initTable() {
        await query(`
            CREATE TABLE IF NOT EXISTS cafeteria_items (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10, 2) NOT NULL,
                category VARCHAR(100) NOT NULL,
                image_url TEXT,
                is_available BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
    }
}

module.exports = CafeteriaItem;
