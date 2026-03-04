const { query } = require('./config/db');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
    try {
        const sqlPath = path.join(__dirname, 'migrations', '021_create_club_broadcasts.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running migration: 021_create_club_broadcasts.sql...');
        await query(sql);
        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
}

runMigration();
