const { query } = require('./src/config/db');

const migrateClasses = async () => {
    try {
        console.log('Creating classes table...');

        await query(`
            CREATE TABLE IF NOT EXISTS classes (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                speciality_id UUID NOT NULL REFERENCES specialities(id) ON DELETE CASCADE,
                name VARCHAR(100) NOT NULL,
                level VARCHAR(50), 
                academic_year VARCHAR(20) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP WITH TIME ZONE
            );
        `);

        console.log('Adding indexes for classes...');
        await query(`
            CREATE INDEX IF NOT EXISTS idx_classes_speciality_id ON classes(speciality_id);
        `);

        console.log('Updating students table with class_id...');
        await query(`
            ALTER TABLE students ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES classes(id) ON DELETE SET NULL;
            CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
        `);

        console.log('Adding trigger for classes...');
        await query(`
            DROP TRIGGER IF EXISTS update_classes_modtime ON classes;
            CREATE TRIGGER update_classes_modtime BEFORE UPDATE ON classes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
        `);

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrateClasses();
