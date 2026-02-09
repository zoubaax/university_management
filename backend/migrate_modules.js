const { query } = require('./src/config/db');

const migrateModules = async () => {
    try {
        console.log('Creating modules table...');

        await query(`
            CREATE TABLE IF NOT EXISTS modules (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                speciality_id UUID NOT NULL REFERENCES specialities(id) ON DELETE CASCADE,
                name VARCHAR(100) NOT NULL,
                code VARCHAR(20),
                coefficient DECIMAL(4,2) DEFAULT 1.0,
                description TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP WITH TIME ZONE
            );
        `);

        console.log('Creating class_modules table (Course Assignments)...');
        await query(`
            CREATE TABLE IF NOT EXISTS class_modules (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
                module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
                professor_id UUID REFERENCES employees(id) ON DELETE SET NULL,
                hours_per_week INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(class_id, module_id)
            );
        `);

        console.log('Adding indexes...');
        await query(`
            CREATE INDEX IF NOT EXISTS idx_modules_speciality_id ON modules(speciality_id);
            CREATE INDEX IF NOT EXISTS idx_class_modules_class_id ON class_modules(class_id);
            CREATE INDEX IF NOT EXISTS idx_class_modules_module_id ON class_modules(module_id);
            CREATE INDEX IF NOT EXISTS idx_class_modules_professor_id ON class_modules(professor_id);
        `);

        console.log('Adding triggers...');
        await query(`
            DROP TRIGGER IF EXISTS update_modules_modtime ON modules;
            CREATE TRIGGER update_modules_modtime BEFORE UPDATE ON modules FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
            
            DROP TRIGGER IF EXISTS update_class_modules_modtime ON class_modules;
            CREATE TRIGGER update_class_modules_modtime BEFORE UPDATE ON class_modules FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
        `);

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrateModules();
