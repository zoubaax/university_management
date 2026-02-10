const { query } = require('../config/db');

class Room {
    static async findAll() {
        const result = await query(`
            SELECT r.*, d.name as department_name 
            FROM rooms r 
            LEFT JOIN departments d ON r.department_id = d.id 
            WHERE r.deleted_at IS NULL
            ORDER BY d.name, r.name
        `);
        return result.rows;
    }

    static async findById(id) {
        const result = await query(`
            SELECT r.*, d.name as department_name 
            FROM rooms r 
            LEFT JOIN departments d ON r.department_id = d.id 
            WHERE r.id = $1 AND r.deleted_at IS NULL
        `, [id]);
        return result.rows[0];
    }

    static async findByDepartment(departmentId) {
        const result = await query(`
            SELECT r.*, d.name as department_name 
            FROM rooms r 
            LEFT JOIN departments d ON r.department_id = d.id 
            WHERE r.department_id = $1 AND r.deleted_at IS NULL
            ORDER BY r.name
        `, [departmentId]);
        return result.rows;
    }

    static async create({ department_id, name, capacity, type, floor, building }) {
        const result = await query(`
            INSERT INTO rooms (department_id, name, capacity, type, floor, building)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [department_id, name, capacity, type, floor, building]);
        return result.rows[0];
    }

    static async update(id, { name, capacity, type, is_active, floor, building }) {
        const fields = [];
        const values = [];
        let queryStr = 'UPDATE rooms SET ';

        if (name !== undefined) {
            fields.push(`name = $${fields.length + 1}`);
            values.push(name);
        }
        if (capacity !== undefined) {
            fields.push(`capacity = $${fields.length + 1}`);
            values.push(capacity);
        }
        if (type !== undefined) {
            fields.push(`type = $${fields.length + 1}`);
            values.push(type);
        }
        if (is_active !== undefined) {
            fields.push(`is_active = $${fields.length + 1}`);
            values.push(is_active);
        }
        if (floor !== undefined) {
            fields.push(`floor = $${fields.length + 1}`);
            values.push(floor);
        }
        if (building !== undefined) {
            fields.push(`building = $${fields.length + 1}`);
            values.push(building);
        }

        if (fields.length === 0) return null;

        queryStr += fields.join(', ');
        queryStr += ` WHERE id = $${fields.length + 1} AND deleted_at IS NULL RETURNING *`;
        values.push(id);

        const result = await query(queryStr, values);
        return result.rows[0];
    }

    static async softDelete(id) {
        const result = await query(`
            UPDATE rooms 
            SET deleted_at = CURRENT_TIMESTAMP 
            WHERE id = $1 AND deleted_at IS NULL 
            RETURNING *
        `, [id]);
        return result.rows[0];
    }
}

module.exports = Room;
