const { query } = require('./src/config/db');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const populatePermissions = async () => {
    try {
        console.log('Populating role permissions...');

        // 1. RESPONSIBLE OF DEPARTMENT
        // Can manage academic aspects of their department
        const responsiblePerms = [
            'manage_students', 'view_students',
            'manage_classes', 'view_classes',
            'manage_modules', 'view_modules',
            'manage_schedules', 'view_schedules',
            'manage_specialities', 'view_specialities', // Added
            'manage_rooms', 'view_rooms',               // Added
            'view_grades',
            'manage_student_absences', 'view_student_absences',
            'view_reports',
            'manage_certificates', 'request_certificate'
        ];
        await query(
            `UPDATE roles SET permissions = $1::jsonb WHERE name = 'RESPONSABLE_DEPARTMENT'`,
            [JSON.stringify(responsiblePerms)]
        );
        console.log('Updated RESPONSABLE_DEPARTMENT permissions');

        // 2. DIRECTOR OF DEPARTMENT
        // Similar to responsible but high level
        const directorPerms = [
            'view_students',
            'view_classes',
            'view_modules',
            'view_schedules',
            'view_specialities', // Added
            'view_rooms',        // Added
            'view_grades',
            'view_student_absences',
            'view_reports',
            'manage_certificates'
        ];
        await query(
            `UPDATE roles SET permissions = $1::jsonb WHERE name = 'DIRECTOR_DEPARTMENT'`,
            [JSON.stringify(directorPerms)]
        );
        console.log('Updated DIRECTOR_DEPARTMENT permissions');

        // 3. RH (Human Resources)
        const rhPerms = [
            'manage_staff',      // Employees/Professors
            'manage_departments',
            'manage_absences',   // Employee absences
            'view_staff_reports'
        ];
        await query(
            `UPDATE roles SET permissions = $1::jsonb WHERE name = 'RH'`,
            [JSON.stringify(rhPerms)]
        );
        console.log('Updated RH permissions');

        // 4. SECRETARY
        const secretaryPerms = [
            'manage_students',
            'manage_student_absences',
            'manage_certificates', // print/issue
            'view_schedules'
        ];
        await query(
            `UPDATE roles SET permissions = $1::jsonb WHERE name = 'SECRETARY'`,
            [JSON.stringify(secretaryPerms)]
        );
        console.log('Updated SECRETARY permissions');

        console.log('Done!');
        process.exit(0);
    } catch (err) {
        console.error('Failed to populate permissions:', err);
        process.exit(1);
    }
};

populatePermissions();
