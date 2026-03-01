const { query } = require('./config/db');
const fs = require('fs');
const path = require('path');

async function runFinanceMigration() {
    try {
        console.log('--- Starting Finance System Migration ---');

        const migrationPath = path.join(__dirname, 'migrations', '013_create_finance_system.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        // Run the whole file as one command - pg usually supports this if statements are separated by ;
        await query(sql);

        console.log('✅ Finance system migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Finance migration failed:', error.message);
        process.exit(1);
    }
}

runFinanceMigration();
