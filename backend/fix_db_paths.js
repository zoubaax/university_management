const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: '127.0.0.1',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

async function run() {
    await pool.query(`UPDATE club_gallery SET image_url = REPLACE(image_url, '/uploads/', '/uploads/gallery/') WHERE image_url NOT LIKE '%/gallery/%'`);
    await pool.query(`UPDATE clubs SET logo_url = REPLACE(logo_url, '/public', '') WHERE logo_url LIKE '/public%'`);
    await pool.end();
}
run().catch(e => { console.error(e.message); pool.end(); });
