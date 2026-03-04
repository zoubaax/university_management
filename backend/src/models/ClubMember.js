const { query } = require('../config/db');

class ClubMember {
    static async findByClubId(clubId) {
        const result = await query(
            `SELECT cm.*, 
                    COALESCE(s.first_name, e.first_name, '') || ' ' || COALESCE(s.last_name, e.last_name, '') as student_name, 
                    u.email as student_email
             FROM club_members cm
             JOIN users u ON cm.student_user_id = u.id
             LEFT JOIN students s ON u.id = s.user_id
             LEFT JOIN employees e ON u.id = e.user_id
             WHERE cm.club_id = $1
             ORDER BY cm.joined_at DESC`,
            [clubId]
        );
        return result.rows;
    }

    static async updateStatus(clubId, studentUserId, status) {
        const result = await query(
            `UPDATE club_members 
             SET status = $1 
             WHERE club_id = $2 AND student_user_id = $3 
             RETURNING *`,
            [status, clubId, studentUserId]
        );
        return result.rows[0];
    }

    static async addMember(clubId, studentUserId, role = 'member') {
        const result = await query(
            `INSERT INTO club_members (club_id, student_user_id, club_role, status)
             VALUES ($1, $2, $3, 'pending')
             ON CONFLICT (club_id, student_user_id) DO NOTHING
             RETURNING *`,
            [clubId, studentUserId, role]
        );
        return result.rows[0];
    }
}

module.exports = ClubMember;
