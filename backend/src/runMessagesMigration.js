const { query } = require('./config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        console.log('Running messages migration...');

        const migrationPath = path.join(__dirname, 'migrations', '010_create_messages.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        await query(sql);

        console.log('✅ Messages migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
