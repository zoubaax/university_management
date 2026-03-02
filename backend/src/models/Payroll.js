const { query } = require('../config/db');

class Payroll {
    static async findAll(filters = {}) {
        let sql = `SELECT p.*, e.first_name, e.last_name, e.type as employee_type, d.name as department_name
                   FROM employee_payroll p
                   JOIN employees e ON p.employee_id = e.id
                   LEFT JOIN departments d ON e.department_id = d.id
                   WHERE 1=1`;

        const params = [];
        if (filters.month) {
            params.push(filters.month);
            sql += ` AND p.month = $${params.length}`;
        }
        if (filters.status) {
            params.push(filters.status);
            sql += ` AND p.status = $${params.length}`;
        }

        sql += ` ORDER BY e.last_name ASC`;
        const result = await query(sql, params);
        return result.rows;
    }

    static async findByMonth(month) {
        return this.findAll({ month });
    }

    /**
     * Generate or Refresh payroll for a specific month
     * @param {string} month YYYY-MM
     */
    static async generateForMonth(month) {
        // 1. Get all active employees
        const employeesResult = await query(
            `SELECT id, base_salary, deduction_per_absence FROM employees WHERE deleted_at IS NULL`
        );
        const employees = employeesResult.rows;

        const results = [];

        for (const emp of employees) {
            // 2. Count absence DAYS for this employee in this month
            // We sum the duration (end_date - start_date + 1) for all approved absences
            const absencesResult = await query(
                `SELECT COALESCE(SUM(end_date - start_date + 1), 0) as total_days
                 FROM absences 
                 WHERE employee_id = $1 
                   AND TO_CHAR(start_date, 'YYYY-MM') = $2
                   AND status = 'APPROVED'`,
                [emp.id, month]
            );
            const totalAbsences = parseInt(absencesResult.rows[0].total_days);
            const totalDeductions = totalAbsences * parseFloat(emp.deduction_per_absence || 0);
            const netSalary = parseFloat(emp.base_salary || 0) - totalDeductions;

            // 3. Upsert into payroll table
            const upsertResult = await query(
                `INSERT INTO employee_payroll (employee_id, month, base_salary, total_absences, total_deductions, net_salary, status)
                 VALUES ($1, $2, $3, $4, $5, $6, 'DRAFT')
                 ON CONFLICT (employee_id, month) DO UPDATE 
                 SET base_salary = EXCLUDED.base_salary,
                     total_absences = EXCLUDED.total_absences,
                     total_deductions = EXCLUDED.total_deductions,
                     net_salary = EXCLUDED.net_salary,
                     updated_at = CURRENT_TIMESTAMP
                 RETURNING *`,
                [emp.id, month, emp.base_salary, totalAbsences, totalDeductions, Math.max(0, netSalary)]
            );
            results.push(upsertResult.rows[0]);
        }

        return results;
    }

    static async updateStatus(id, status, paidAt = null) {
        const result = await query(
            `UPDATE employee_payroll 
             SET status = $1, 
                 paid_at = $2,
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $3 
             RETURNING *`,
            [status, paidAt, id]
        );
        return result.rows[0];
    }

    static async getStats(month) {
        const result = await query(
            `SELECT 
                COALESCE(SUM(base_salary), 0) as total_base,
                COALESCE(SUM(total_deductions), 0) as total_deductions,
                COALESCE(SUM(net_salary), 0) as total_net,
                COUNT(*) as employee_count
             FROM employee_payroll
             WHERE month = $1`,
            [month]
        );
        return result.rows[0];
    }
}

module.exports = Payroll;
