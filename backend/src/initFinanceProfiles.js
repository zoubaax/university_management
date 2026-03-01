const { query } = require('./config/db');
const Finance = require('./models/Finance');

async function initializeProfiles() {
    try {
        console.log('--- Initializing Finance Profiles for Existing Students ---');

        // Get all students
        const studentsRes = await query('SELECT id FROM students');
        const students = studentsRes.rows;

        console.log(`Found ${students.length} students to initialize.`);

        for (const student of students) {
            try {
                // Defaulting everyone to MONTHLY plan with no partnership for now
                await Finance.updateFinanceProfile(student.id, 'MONTHLY', null);
                console.log(`✅ Initialized student: ${student.id}`);
            } catch (err) {
                console.warn(`⚠️ skipping student ${student.id}: ${err.message}`);
            }
        }

        console.log('✅ Initialization complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        process.exit(1);
    }
}

initializeProfiles();
