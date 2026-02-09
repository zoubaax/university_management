const { query } = require('./src/config/db');

async function getRoles() {
    try {
        const res = await query('SELECT id, name FROM roles');
        console.log(JSON.stringify(res.rows));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

getRoles();
