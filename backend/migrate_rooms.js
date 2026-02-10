const { query } = require('./src/config/db');

const migrateRooms = async () => {
    try {
        console.log('Creating rooms table...');

        // Create rooms table
        await query(`
            CREATE TABLE IF NOT EXISTS rooms (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
                name VARCHAR(50) NOT NULL,
                capacity INT DEFAULT 30,
                type VARCHAR(50) DEFAULT 'Classroom', -- Classroom, Lab, Amphitheater
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                deleted_at TIMESTAMP WITH TIME ZONE,
                UNIQUE(department_id, name)
            );
        `);

        // Add indexes
        console.log('Adding indexes...');
        await query(`
            CREATE INDEX IF NOT EXISTS idx_rooms_department_id ON rooms(department_id);
        `);

        // Add trigger for updated_at
        console.log('Adding triggers...');
        await query(`
            DROP TRIGGER IF EXISTS update_rooms_modtime ON rooms;
            CREATE TRIGGER update_rooms_modtime BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
        `);

        console.log('Rooms migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Rooms migration failed:', err);
        process.exit(1);
    }
};

migrateRooms();
