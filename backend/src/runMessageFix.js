const { query } = require('./config/db');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'migrations', '019_fix_message_types.sql'), 'utf8');
        console.log('Running migration: 019_fix_message_types.sql...');
        await query(sql);
        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
}

runMigration();
