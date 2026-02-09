const { query } = require('./src/config/db');

const migrateStudentsV2 = async () => {
    try {
        console.log('Enhancing students table with new fields...');

        await query(`
            ALTER TABLE students 
            ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
            ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
            ADD COLUMN IF NOT EXISTS cin VARCHAR(50),
            ADD COLUMN IF NOT EXISTS bac_document_url TEXT,
            ADD COLUMN IF NOT EXISTS cin_document_url TEXT,
            ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL;
        `);

        // Create indexes for performance
        await query(`
            CREATE INDEX IF NOT EXISTS idx_students_cin ON students(cin);
            CREATE INDEX IF NOT EXISTS idx_students_department_id ON students(department_id);
        `);

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrateStudentsV2();
