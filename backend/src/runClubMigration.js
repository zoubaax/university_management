const fs = require('fs');
const path = require('path');
const { query } = require('./config/db');

async function runMigration() {
    try {
        console.log('Starting club system migration...');

        const sqlPath = path.join(__dirname, 'migrations', '016_create_club_system.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Execute the SQL
        await query(sql);

        console.log('Club system migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error running migration:', error);
        process.exit(1);
    }
}

runMigration();
