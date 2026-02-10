const { query } = require('./src/config/db');

const migrateRoomsV2 = async () => {
    try {
        console.log('Migrating rooms table to V2...');

        // Add floor and building columns if they don't exist
        await query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'floor') THEN
                    ALTER TABLE rooms ADD COLUMN floor VARCHAR(50);
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'building') THEN
                    ALTER TABLE rooms ADD COLUMN building VARCHAR(100);
                END IF;
            END $$;
        `);

        console.log('Rooms migration V2 completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Rooms migration V2 failed:', err);
        process.exit(1);
    }
};

migrateRoomsV2();
