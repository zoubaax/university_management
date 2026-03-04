const { query } = require('../config/db');

class ClubEvent {
    static async findByClubId(clubId) {
        const result = await query(
            `SELECT ce.*, COUNT(cer.student_user_id)::int as rsvp_count 
             FROM club_events ce
             LEFT JOIN club_event_rsvps cer ON ce.id = cer.event_id
             WHERE ce.club_id = $1 
             GROUP BY ce.id
             ORDER BY ce.start_time ASC`,
            [clubId]
        );
        return result.rows;
    }

    static async create({ club_id, title, description, start_time, end_time, location }) {
        const result = await query(
            `INSERT INTO club_events (club_id, title, description, start_time, end_time, location)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [club_id, title, description, start_time, end_time, location]
        );
        return result.rows[0];
    }

    static async update(id, { title, description, start_time, end_time, location }) {
        const result = await query(
            `UPDATE club_events 
             SET title = COALESCE($1, title),
                 description = COALESCE($2, description),
                 start_time = COALESCE($3, start_time),
                 end_time = COALESCE($4, end_time),
                 location = COALESCE($5, location)
             WHERE id = $6 RETURNING *`,
            [title, description, start_time, end_time, location, id]
        );
        return result.rows[0];
    }

    static async delete(id) {
        const result = await query(`DELETE FROM club_events WHERE id = $1 RETURNING *`, [id]);
        return result.rows[0];
    }

    static async rsvp(eventId, studentUserId) {
        const result = await query(
            `INSERT INTO club_event_rsvps (event_id, student_user_id)
             VALUES ($1, $2)
             ON CONFLICT (event_id, student_user_id) DO NOTHING
             RETURNING *`,
            [eventId, studentUserId]
        );
        return result.rows[0];
    }

    static async getRSVPs(eventId) {
        const result = await query(
            `SELECT cer.*, 
                    COALESCE(s.first_name, e.first_name, '') as first_name, 
                    COALESCE(s.last_name, e.last_name, '') as last_name, 
                    u.email 
             FROM club_event_rsvps cer
             JOIN users u ON cer.student_user_id = u.id
             LEFT JOIN students s ON u.id = s.user_id
             LEFT JOIN employees e ON u.id = e.user_id
             WHERE cer.event_id = $1`,
            [eventId]
        );
        return result.rows;
    }
}

module.exports = ClubEvent;
