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

    static async updateRole(clubId, studentUserId, role) {
        const result = await query(
            `UPDATE club_members 
             SET club_role = $1 
             WHERE club_id = $2 AND student_user_id = $3 
             RETURNING *`,
            [role, clubId, studentUserId]
        );
        return result.rows[0];
    }

    static async addMember(clubId, studentUserId, role = 'member') {
        // 1. Check if club is accepting new members
        const clubRes = await query('SELECT registration_open FROM clubs WHERE id = $1', [clubId]);
        if (clubRes.rows.length === 0) throw new Error('Club not found');
        if (!clubRes.rows[0].registration_open) {
            throw new Error('This club is currently not accepting new applications.');
        }

        const result = await query(
            `INSERT INTO club_members (club_id, student_user_id, club_role, status)
             VALUES ($1, $2, $3, 'pending')
             ON CONFLICT (club_id, student_user_id) DO NOTHING
             RETURNING *`,
            [clubId, studentUserId, role]
        );
        return result.rows[0];
    }

    static async findApprovedMembers(clubId) {
        const result = await query(
            `SELECT student_user_id FROM club_members 
             WHERE club_id = $1 AND status = 'approved'`,
            [clubId]
        );
        return result.rows;
    }
}

module.exports = ClubMember;
