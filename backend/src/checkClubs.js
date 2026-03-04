const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ user: process.env.DB_USER, host: process.env.DB_HOST, database: process.env.DB_NAME, password: process.env.DB_PASSWORD, port: process.env.DB_PORT });

async function run() {
    const r = await pool.query(`SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'clubs'`);
    r.rows.forEach(c => console.log(c.column_name, '|', c.data_type, '| nullable:', c.is_nullable, '| default:', c.column_default));
    await pool.end();
}
run().catch(e => { console.error(e.message); pool.end(); });
