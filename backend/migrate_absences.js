const { query } = require('./src/config/db');

const applyMigration = async () => {
    try {
        console.log('Starting migration for absences...');

        await query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'absence_type') THEN
                    CREATE TYPE absence_type AS ENUM ('SICK', 'VACATION', 'UNEXCUSED', 'PAID_LEAVE', 'OTHER');
                END IF;
                
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'absence_status') THEN
                    CREATE TYPE absence_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'JUSTIFIED');
                END IF;
            END $$;
        `);

        await query(`
            CREATE TABLE IF NOT EXISTS absences (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                type absence_type NOT NULL DEFAULT 'UNEXCUSED',
                reason TEXT,
                status absence_status NOT NULL DEFAULT 'PENDING',
                recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP WITH TIME ZONE
            );
        `);

        await query(`CREATE INDEX IF NOT EXISTS idx_absences_employee_id ON absences(employee_id);`);
        await query(`CREATE INDEX IF NOT EXISTS idx_absences_dates ON absences(start_date, end_date);`);

        await query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_absences_modtime') THEN
                    CREATE TRIGGER update_absences_modtime 
                    BEFORE UPDATE ON absences FOR EACH ROW 
                    EXECUTE PROCEDURE update_updated_at_column();
                END IF;
            END $$;
        `);

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

applyMigration();
