const { query } = require('./src/config/db');
require('dotenv').config();

async function checkTables() {
    try {
        const res = await query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('clubs', 'club_members', 'club_events', 'club_event_rsvps')
        `);
        console.log('Existing club tables:', res.rows.map(r => r.table_name));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkTables();
