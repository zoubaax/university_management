const { query } = require('./src/config/db');
require('dotenv').config();

async function checkColumns() {
    try {
        const tables = ['club_members', 'club_events'];
        for (const table of tables) {
            const res = await query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
            `, [table]);
            console.log(`Columns for ${table}:`, res.rows);
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkColumns();
