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
    const fs = require('fs');
    let out = '--- GALLERY ENTRIES ---\n';
    const res = await pool.query(`SELECT image_url FROM club_gallery`);
    out += JSON.stringify(res.rows, null, 2) + '\n';

    out += '--- CLUB LOGO ENTRIES ---\n';
    const res2 = await pool.query(`SELECT logo_url FROM clubs`);
    out += JSON.stringify(res2.rows, null, 2) + '\n';

    fs.writeFileSync(path.join(__dirname, 'db_images.txt'), out);
    await pool.end();
}
run().catch(e => { console.error(e.message); pool.end(); });
