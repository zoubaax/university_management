const { query } = require('./src/config/db');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables for DB connection
dotenv.config();

const migrate = async () => {
    try {
        console.log('Running migration...');
        const sqlPath = path.join(__dirname, 'src/migrations/012_update_roles.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Execute SQL
        await query(sql);

        console.log('Migration for roles completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
