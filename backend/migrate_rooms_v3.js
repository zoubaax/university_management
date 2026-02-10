const { query } = require('./src/config/db');

const migrateRoomsV3 = async () => {
    try {
        console.log('Migrating rooms table to V3: Adding speciality_id...');

        // Add speciality_id column and foreign key constraint
        await query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'speciality_id') THEN
                    ALTER TABLE rooms ADD COLUMN speciality_id UUID REFERENCES specialities(id) ON DELETE SET NULL;
                END IF;
            END $$;
        `);

        // Check if building column exists, rename it (or just ignore it if we are replacing it in UI)
        // I'll keep 'building' for now as backward compatibility, but I will focus on speciality_id.
        // Or if requested "change building by department and make it filier" implies renaming?
        // Let's assume just adding speciality_id is safer.
        // Also dropping 'building' column if desired later.
        // But for now, let's just ADD speciality_id.

        console.log('Rooms migration V3 completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Rooms migration V3 failed:', err);
        process.exit(1);
    }
};

migrateRoomsV3();
