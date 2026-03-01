const { query } = require('../config/db');

class Speciality {
    static async findAll() {
        const result = await query(
            `SELECT s.*, d.name as department_name, COUNT(st.id) as student_count
       FROM specialities s 
       JOIN departments d ON s.department_id = d.id 
       LEFT JOIN students st ON s.id = st.speciality_id AND st.deleted_at IS NULL
       WHERE s.deleted_at IS NULL 
       GROUP BY s.id, d.name
       ORDER BY s.name ASC`
        );
        return result.rows;
    }

    static async findByDepartment(departmentId) {
        const result = await query(
            `SELECT s.*, d.name as department_name, COUNT(st.id) as student_count
       FROM specialities s 
       JOIN departments d ON s.department_id = d.id 
       LEFT JOIN students st ON s.id = st.speciality_id AND st.deleted_at IS NULL
       WHERE s.department_id = $1 AND s.deleted_at IS NULL 
       GROUP BY s.id, d.name
       ORDER BY s.name ASC`,
            [departmentId]
        );
        return result.rows;
    }

    static async findById(id) {
        const result = await query(
            'SELECT * FROM specialities WHERE id = $1 AND deleted_at IS NULL',
            [id]
        );
        return result.rows[0];
    }

    static async create({ department_id, name, yearly_price }) {
        const result = await query(
            'INSERT INTO specialities (department_id, name, yearly_price) VALUES ($1, $2, $3) RETURNING *',
            [department_id, name, yearly_price || 0.00]
        );
        return result.rows[0];
    }

    static async update(id, { name, department_id, yearly_price }) {
        const result = await query(
            'UPDATE specialities SET name = COALESCE($1, name), department_id = COALESCE($2, department_id), yearly_price = COALESCE($3, yearly_price), updated_at = CURRENT_TIMESTAMP WHERE id = $4 AND deleted_at IS NULL RETURNING *',
            [name, department_id, yearly_price, id]
        );
        return result.rows[0];
    }

    static async softDelete(id) {
        const result = await query(
            'UPDATE specialities SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
            [id]
        );
        return result.rows[0];
    }
}

module.exports = Speciality;
