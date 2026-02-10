const { query } = require('./src/config/db');

const patchModules = async () => {
    try {
        console.log('Patching modules table to add semester column...');

        await query(`
            ALTER TABLE modules 
            ADD COLUMN IF NOT EXISTS semester INTEGER CHECK (semester IN (1, 2)) DEFAULT 1;
        `);

        console.log('Patch completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Patch failed:', err);
        process.exit(1);
    }
};

patchModules();
