const { query } = require('./src/config/db');

async function migrate() {
    try {
        console.log('Starting migration: grades...');

        // Create grades table
        await query(`
            CREATE TABLE IF NOT EXISTS student_grades (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
                module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
                class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
                professor_id UUID NOT NULL REFERENCES employees(id) ON DELETE SET NULL,
                cc1 DECIMAL(5, 2) DEFAULT NULL,
                cc2 DECIMAL(5, 2) DEFAULT NULL,
                exam DECIMAL(5, 2) DEFAULT NULL,
                semester INTEGER NOT NULL DEFAULT 1,
                academic_year VARCHAR(20) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(student_id, module_id, academic_year)
            )
        `);

        // Add trigger for updated_at
        await query(`
            DROP TRIGGER IF EXISTS update_student_grades_modtime ON student_grades;
            CREATE TRIGGER update_student_grades_modtime 
            BEFORE UPDATE ON student_grades 
            FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
        `);

        console.log('Migration completed successfully: grades table created.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit();
    }
}

migrate();
