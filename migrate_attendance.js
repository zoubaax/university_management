const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const { query } = require('./backend/src/config/db');

const migrate = async () => {
    try {
        await query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status') THEN
                    CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'JUSTIFIED');
                END IF;
            END $$;
        `);

        await query(`
            CREATE TABLE IF NOT EXISTS student_attendance (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
                schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
                date DATE NOT NULL,
                status attendance_status NOT NULL DEFAULT 'PRESENT',
                recorded_by UUID REFERENCES employees(id) ON DELETE SET NULL,
                remarks TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(student_id, schedule_id, date)
            );
        `);
        console.log('Migration successful: student_attendance table ready');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit();
    }
};

migrate();
