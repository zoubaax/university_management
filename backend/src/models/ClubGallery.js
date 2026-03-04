const { query } = require('../config/db');

class ClubGallery {
    static async findByClubId(clubId) {
        const result = await query(
            `SELECT * FROM club_gallery WHERE club_id = $1 ORDER BY created_at DESC`,
            [clubId]
        );
        return result.rows;
    }

    static async create({ club_id, image_url, caption }) {
        const result = await query(
            `INSERT INTO club_gallery (club_id, image_url, caption)
             VALUES ($1, $2, $3) RETURNING *`,
            [club_id, image_url, caption]
        );
        return result.rows[0];
    }

    static async delete(id) {
        const result = await query(`DELETE FROM club_gallery WHERE id = $1 RETURNING *`, [id]);
        return result.rows[0];
    }
}

module.exports = ClubGallery;
