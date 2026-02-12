const { query } = require('./src/config/db');
const dotenv = require('dotenv');

dotenv.config();

const checkPermissions = async () => {
    try {
        const result = await query('SELECT name, permissions FROM roles');
        console.log(JSON.stringify(result.rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkPermissions();
