const { query } = require('../config/db');

class ClubBroadcast {
    static async create({ club_id, sender_id, subject, body }) {
        const result = await query(
            `INSERT INTO club_broadcasts (club_id, sender_id, subject, body)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [club_id, sender_id, subject, body]
        );
        return result.rows[0];
    }

    static async findByClubId(clubId) {
        const result = await query(
            `SELECT cb.*, u.email as sender_email
             FROM club_broadcasts cb
             LEFT JOIN users u ON cb.sender_id = u.id
             WHERE cb.club_id = $1
             ORDER BY cb.created_at DESC`,
            [clubId]
        );
        return result.rows;
    }
}

module.exports = ClubBroadcast;
