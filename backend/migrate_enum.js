const { query } = require('./src/config/db');

async function migrate() {
    try {
        console.log('Migrating employee_category enum...');
        // Check if RH already exists in the enum
        const res = await query("SELECT enum_range(NULL::employee_category)");
        const currentEnum = res.rows[0].enum_range;

        if (!currentEnum.includes('RH')) {
            await query("ALTER TYPE employee_category ADD VALUE 'RH'");
            console.log('SUCCESS: Added RH to employee_category enum');
        } else {
            console.log('INFO: RH already exists in enum');
        }
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
