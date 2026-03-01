const { query } = require('../config/db');

/**
 * @desc    Get Super Admin dashboard statistics
 * @route   GET /api/v1/dashboard/admin-stats
 * @access  Private/SuperAdmin
 */
exports.getAdminStats = async (req, res, next) => {
    try {
        // 1. Core Counts
        const counts = await query(`
            SELECT 
                (SELECT COUNT(*) FROM students WHERE deleted_at IS NULL) as students_count,
                (SELECT COUNT(*) FROM employees WHERE deleted_at IS NULL) as staff_count,
                (SELECT COUNT(*) FROM departments WHERE deleted_at IS NULL) as departments_count,
                (SELECT COUNT(*) FROM roles) as roles_count
        `);

        // 2. Student distribution by Department
        const studentDist = await query(`
            SELECT d.name as name, COUNT(s.id) as value
            FROM departments d
            LEFT JOIN students s ON d.id = s.department_id AND s.deleted_at IS NULL
            GROUP BY d.id, d.name
            ORDER BY value DESC
        `);

        // 3. User distribution by Role
        const roleDist = await query(`
            SELECT r.name as name, COUNT(u.id) as value
            FROM roles r
            LEFT JOIN users u ON r.id = u.role_id AND u.deleted_at IS NULL
            GROUP BY r.id, r.name
        `);

        // 4. Absence trends (Last 7 days)
        const absenceTrends = await query(`
            SELECT 
                TO_CHAR(date, 'DD/MM') as date,
                COUNT(*) FILTER (WHERE status = 'ABSENT') as absent_count,
                COUNT(*) FILTER (WHERE status = 'PRESENT') as present_count
            FROM student_attendance
            WHERE date > CURRENT_DATE - INTERVAL '7 days'
            GROUP BY "student_attendance".date
            ORDER BY "student_attendance".date ASC
        `);

        // 5. Monthly enrollment trends (Last 6 months)
        const enrollmentTrends = await query(`
            SELECT 
                TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') as month,
                COUNT(*) as count
            FROM students
            WHERE deleted_at IS NULL
              AND created_at > NOW() - INTERVAL '6 months'
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY DATE_TRUNC('month', created_at) ASC
        `);

        // 6. Finance summary (revenue by month, last 6 months)
        let financeSummary = [];
        try {
            const finResult = await query(`
                SELECT
                    TO_CHAR(DATE_TRUNC('month', payment_date), 'Mon') as month,
                    SUM(amount) as revenue
                FROM finance
                WHERE payment_date > NOW() - INTERVAL '6 months'
                GROUP BY DATE_TRUNC('month', payment_date)
                ORDER BY DATE_TRUNC('month', payment_date) ASC
            `);
            financeSummary = finResult.rows.map(r => ({
                month: r.month,
                revenue: parseFloat(r.revenue) || 0
            }));
        } catch (_) {
            // finance table may not exist for all setups
        }

        res.status(200).json({
            success: true,
            data: {
                counts: counts.rows[0],
                studentDistribution: studentDist.rows,
                roleDistribution: roleDist.rows,
                absenceTrends: absenceTrends.rows,
                enrollmentTrends: enrollmentTrends.rows,
                financeSummary
            }
        });
    } catch (err) {
        next(err);
    }
};
