const { query } = require('../config/db');

class Schedule {
    static async findAllByClass(classId) {
        const result = await query(
            `SELECT s.*, m.name as module_name, m.code as module_code,
                    e.first_name as professor_first_name, e.last_name as professor_last_name
             FROM schedules s
             JOIN modules m ON s.module_id = m.id
             LEFT JOIN employees e ON s.professor_id = e.id
             WHERE s.class_id = $1
             ORDER BY 
                CASE s.day_of_week
                    WHEN 'Monday' THEN 1
                    WHEN 'Tuesday' THEN 2
                    WHEN 'Wednesday' THEN 3
                    WHEN 'Thursday' THEN 4
                    WHEN 'Friday' THEN 5
                    WHEN 'Saturday' THEN 6
                END,
                CASE s.slot_type
                    WHEN 'MORNING' THEN 1
                    WHEN 'AFTERNOON' THEN 2
                END`,
            [classId]
        );
        return result.rows;
    }

    static async findAllByProfessor(professorId) {
        const result = await query(
            `SELECT s.*, m.name as module_name, m.code as module_code,
                    c.name as class_name, spec.name as speciality_name
             FROM schedules s
             JOIN modules m ON s.module_id = m.id
             JOIN classes c ON s.class_id = c.id
             JOIN specialities spec ON c.speciality_id = spec.id
             WHERE s.professor_id = $1
             ORDER BY 
                CASE s.day_of_week
                    WHEN 'Monday' THEN 1
                    WHEN 'Tuesday' THEN 2
                    WHEN 'Wednesday' THEN 3
                    WHEN 'Thursday' THEN 4
                    WHEN 'Friday' THEN 5
                    WHEN 'Saturday' THEN 6
                END,
                CASE s.slot_type
                    WHEN 'MORNING' THEN 1
                    WHEN 'AFTERNOON' THEN 2
                END`,
            [professorId]
        );
        return result.rows;
    }

    static async checkRoomConflict(room, day_of_week, slot_type, excludeClassId = null) {
        const result = await query(
            `SELECT s.*, c.name as class_name
             FROM schedules s
             JOIN classes c ON s.class_id = c.id
             WHERE s.room = $1 
               AND s.day_of_week = $2 
               AND s.slot_type = $3
               AND ($4::uuid IS NULL OR s.class_id != $4)`,
            [room, day_of_week, slot_type, excludeClassId]
        );
        return result.rows[0]; // Returns the conflicting schedule if exists
    }

    static async checkAvailability(room, day_of_week, slot_type, excludeClassId = null) {
        const conflict = await this.checkRoomConflict(room, day_of_week, slot_type, excludeClassId);
        return {
            available: !conflict,
            conflict: conflict || null
        };
    }

    static async upsert(data) {
        const { class_id, module_id, professor_id, day_of_week, slot_type, room } = data;

        // Check for room conflicts (excluding the current class being updated)
        if (room) {
            const conflict = await this.checkRoomConflict(room, day_of_week, slot_type, class_id);
            if (conflict) {
                const error = new Error(`Room "${room}" is already reserved for "${conflict.class_name}" on ${day_of_week} ${slot_type}`);
                error.statusCode = 409; // Conflict
                throw error;
            }
        }

        const result = await query(
            `INSERT INTO schedules (class_id, module_id, professor_id, day_of_week, slot_type, room)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (class_id, day_of_week, slot_type)
             DO UPDATE SET 
                module_id = EXCLUDED.module_id,
                professor_id = EXCLUDED.professor_id,
                room = EXCLUDED.room,
                updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [class_id, module_id, professor_id, day_of_week, slot_type, room]
        );
        return result.rows[0];
    }

    static async delete(id) {
        const result = await query(
            'DELETE FROM schedules WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0];
    }

    static async findById(id) {
        const result = await query(
            `SELECT s.*, c.name as class_name, c.speciality_id, spec.department_id
             FROM schedules s
             JOIN classes c ON s.class_id = c.id
             JOIN specialities spec ON c.speciality_id = spec.id
             WHERE s.id = $1`,
            [id]
        );
        return result.rows[0];
    }
}

module.exports = Schedule;
