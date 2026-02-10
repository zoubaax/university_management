const { query } = require('./src/config/db');

const migrateSchedules = async () => {
    try {
        console.log('Creating schedules table...');

        await query(`
            CREATE TABLE IF NOT EXISTS schedules (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
                module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
                professor_id UUID REFERENCES employees(id) ON DELETE SET NULL,
                day_of_week VARCHAR(10) NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
                slot_type VARCHAR(10) NOT NULL CHECK (slot_type IN ('MORNING', 'AFTERNOON')),
                room VARCHAR(50),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(class_id, day_of_week, slot_type)
            );
        `);

        console.log('Adding indexes...');
        await query(`
            CREATE INDEX IF NOT EXISTS idx_schedules_class_id ON schedules(class_id);
            CREATE INDEX IF NOT EXISTS idx_schedules_day_slot ON schedules(day_of_week, slot_type);
        `);

        console.log('Adding triggers...');
        await query(`
            DROP TRIGGER IF EXISTS update_schedules_modtime ON schedules;
            CREATE TRIGGER update_schedules_modtime BEFORE UPDATE ON schedules FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
        `);

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrateSchedules();
