const { query } = require('./src/config/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const resetAdmin = async () => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin@123', salt);

        const result = await query(
            'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING email',
            [hashedPassword, 'admin@smartupf.com']
        );

        if (result.rows.length > 0) {
            console.log('Admin password reset successfully for:', result.rows[0].email);
        } else {
            console.log('Admin user not found. Creating it...');
            // Need a role ID
            const roleRes = await query("SELECT id FROM roles WHERE name = 'SUPER_ADMIN'");
            if (roleRes.rows.length === 0) throw new Error('SUPER_ADMIN role not found');
            const roleId = roleRes.rows[0].id;

            await query(
                'INSERT INTO users (email, password_hash, role_id) VALUES ($1, $2, $3)',
                ['admin@smartupf.com', hashedPassword, roleId]
            );
            console.log('Admin user created successfully.');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error resetting admin:', err);
        process.exit(1);
    }
};

resetAdmin();
