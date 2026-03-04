const fs = require('fs');
const path = require('path');
const { query } = require('./config/db');

async function runMigration() {
    try {
        console.log('Running fix clubs category migration...');
        const sqlPath = path.join(__dirname, 'migrations', '018_fix_clubs_category.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        await query(sql);
        console.log('Fix clubs migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error running migration:', error);
        process.exit(1);
    }
}

runMigration();
