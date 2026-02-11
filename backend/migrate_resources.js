const { Pool } = require('pg');
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
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'resource_type') THEN
                    CREATE TYPE resource_type AS ENUM ('COURSE', 'TP', 'EXAM', 'OTHER');
                END IF;
            END $$;
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS course_resources (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
                module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
                professor_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
                type resource_type NOT NULL DEFAULT 'COURSE',
                title VARCHAR(255) NOT NULL,
                description TEXT,
                file_path TEXT,
                file_name VARCHAR(255),
                file_size INTEGER,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Migration successful: course_resources table ready');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
        process.exit();
    }
};

migrate();
