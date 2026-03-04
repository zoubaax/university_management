const { Pool } = require('pg');
require('dotenv').config();
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: '127.0.0.1',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

async function run() {
    console.log('--- USERS TABLE ---');
    const u = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'users'`);
    console.log(u.rows.map(r => r.column_name).join(', '));

    console.log('--- STUDENTS TABLE ---');
    const s = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'students'`);
    console.log(s.rows.map(r => r.column_name).join(', '));

    await pool.end();
}
run().catch(e => { console.error(e.message); pool.end(); });
