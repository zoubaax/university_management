const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: '127.0.0.1',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

async function migrate() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'src/migrations/022_create_club_gallery.sql'), 'utf8');
        await pool.query(sql);
        console.log('Migration 022 (Gallery) completed successfully');
        process.exit(0);
    } catch (e) {
        console.error('Migration failed:', e.message);
        process.exit(1);
    }
}
migrate();
