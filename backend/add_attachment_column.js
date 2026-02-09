const { query } = require('./src/config/db');

const addAttachmentColumn = async () => {
    try {
        console.log('Adding attachment_url to absences table...');
        await query(`
            ALTER TABLE absences 
            ADD COLUMN IF NOT EXISTS attachment_url TEXT;
        `);
        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

addAttachmentColumn();
