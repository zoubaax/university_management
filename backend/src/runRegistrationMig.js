const { query } = require('./config/db');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'migrations', '020_add_club_registration_toggle.sql'), 'utf8');
        console.log('Running migration: 020_add_club_registration_toggle.sql...');
        await query(sql);
        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
}

runMigration();
