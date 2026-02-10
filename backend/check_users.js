const { query } = require('./src/config/db');
require('dotenv').config();

const checkUsers = async () => {
    try {
        const result = await query('SELECT email, r.name as role FROM users u JOIN roles r ON u.role_id = r.id');
        console.log('Registered Users:', JSON.stringify(result.rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('Error checking users:', err);
        process.exit(1);
    }
};

checkUsers();
