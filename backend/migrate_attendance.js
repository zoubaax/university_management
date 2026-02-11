const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const migrate = async () => {
    try {
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status') THEN
                    CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'JUSTIFIED');
                END IF;
            END $$;
        `);

        await pool.query(`
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
        await pool.end();
        process.exit();
    }
};

migrate();
