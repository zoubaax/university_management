const { query } = require('../config/db');

class Finance {
    // 1. Get statistics for the Financier dashboard
    static async getStats() {
        const result = await query(`
            SELECT 
                COALESCE(SUM(total_amount_due), 0) as total_expected,
                COALESCE(SUM(total_amount_due - remaining_balance), 0) as total_collected,
                COALESCE(SUM(remaining_balance), 0) as total_outstanding,
                (SELECT COUNT(*) FROM student_finance_profiles WHERE remaining_balance > 0) as students_with_debt
            FROM student_finance_profiles
        `);
        return result.rows[0];
    }

    // 2. Get students with their finance profiles
    static async getStudentProfiles(filters = {}) {
        let sql = `
            SELECT 
                s.id as student_id,
                u.email,
                s.first_name,
                s.last_name,
                sp.name as speciality_name,
                d.name as department_name,
                sfp.payment_plan,
                sfp.total_amount_due,
                sfp.remaining_balance,
                sfp.is_fully_paid,
                p.company_name as partnership_name
            FROM students s
            JOIN users u ON s.user_id = u.id
            JOIN specialities sp ON s.speciality_id = sp.id
            JOIN departments d ON sp.department_id = d.id
            LEFT JOIN student_finance_profiles sfp ON s.id = sfp.student_id
            LEFT JOIN partnerships p ON sfp.partnership_id = p.id
            WHERE u.deleted_at IS NULL
        `;

        const params = [];
        if (filters.hasDebt) {
            sql += ` AND sfp.remaining_balance > 0`;
        }
        if (filters.studentId) {
            params.push(filters.studentId);
            sql += ` AND s.id = $${params.length}`;
        }

        sql += ` ORDER BY s.last_name, s.first_name`;

        const result = await query(sql, params);
        return result.rows;
    }

    // 3. Record a new payment (Cash, Check, Transfer)
    static async createPayment(data) {
        const { student_id, amount, payment_method, check_number, bank_name, receipt_url, notes, verified_by } = data;

        // Use a transaction
        const client = await require('../config/db').pool.connect();
        try {
            await client.query('BEGIN');

            const paymentResult = await client.query(`
                INSERT INTO finance_payments 
                (student_id, amount, payment_method, check_number, bank_name, receipt_url, status, notes, verified_by, verified_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *
            `, [
                student_id,
                amount,
                payment_method,
                check_number,
                bank_name,
                receipt_url,
                payment_method === 'CASH' ? 'VERIFIED' : 'PENDING',
                notes,
                payment_method === 'CASH' ? verified_by : null,
                payment_method === 'CASH' ? new Date() : null
            ]);

            const payment = paymentResult.rows[0];

            // If it's cash, update the student balance immediately
            if (payment_method === 'CASH') {
                await client.query(`
                    UPDATE student_finance_profiles
                    SET remaining_balance = remaining_balance - $1,
                        is_fully_paid = (remaining_balance - $1 <= 0)
                    WHERE student_id = $2
                `, [amount, student_id]);
            }

            await client.query('COMMIT');
            return payment;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // 4. Verify a check or transfer
    static async verifyPayment(paymentId, financierId) {
        const client = await require('../config/db').pool.connect();
        try {
            await client.query('BEGIN');

            const paymentRes = await client.query('SELECT * FROM finance_payments WHERE id = $1', [paymentId]);
            const payment = paymentRes.rows[0];

            if (!payment || payment.status === 'VERIFIED') {
                throw new Error('Payment already verified or not found');
            }

            const verifiedPaymentRes = await client.query(`
                UPDATE finance_payments
                SET status = 'VERIFIED',
                    verified_by = $1,
                    verified_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING *
            `, [financierId, paymentId]);

            // Update student balance
            await client.query(`
                UPDATE student_finance_profiles
                SET remaining_balance = remaining_balance - $1,
                    is_fully_paid = (remaining_balance - $1 <= 0)
                WHERE student_id = $2
            `, [payment.amount, payment.student_id]);

            await client.query('COMMIT');
            return verifiedPaymentRes.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // 5. Initialize or update a student's finance profile
    static async updateFinanceProfile(studentId, plan, partnershipId) {
        // First get the student's pricing hierarchy (Specialty > Department)
        const studentRes = await query(`
            SELECT 
                s.id, 
                sp.yearly_price as specialty_price,
                d.yearly_price as department_price
            FROM students s 
            JOIN specialities sp ON s.speciality_id = sp.id 
            JOIN departments d ON sp.department_id = d.id
            WHERE s.id = $1
        `, [studentId]);

        const student = studentRes.rows[0];
        if (!student) throw new Error('Student not found');

        // Heirarchy: Speciality Price (if > 0) else fallback to Department Price
        let base_amount = (parseFloat(student.specialty_price) > 0)
            ? parseFloat(student.specialty_price)
            : parseFloat(student.department_price || 0);

        // If plan or partnershipId not provided, get from existing profile (for auto-syncing)
        if (!plan || partnershipId === undefined) {
            const existingRes = await query('SELECT payment_plan, partnership_id FROM student_finance_profiles WHERE student_id = $1', [studentId]);
            const existing = existingRes.rows[0];
            if (!plan) plan = existing?.payment_plan || 'MONTHLY';
            if (partnershipId === undefined) partnershipId = existing?.partnership_id || null;
        }

        let discount_amount = 0;

        // Apply partner discount (20% if exists)
        if (partnershipId) {
            const partnerRes = await query('SELECT discount_percentage FROM partnerships WHERE id = $1', [partnershipId]);
            if (partnerRes.rows[0]) {
                discount_amount += base_amount * (parseFloat(partnerRes.rows[0].discount_percentage) / 100);
            }
        }

        // Apply full payment discount (-5% on the REMAINING amount after partner discount)
        if (plan === 'FULL') {
            discount_amount += (base_amount - discount_amount) * 0.05;
        }

        const total_amount_due = base_amount - discount_amount;

        // Calculate current paid amount to keep track of remaining balance
        const paidRes = await query(`
            SELECT COALESCE(SUM(amount), 0) as paid 
            FROM finance_payments 
            WHERE student_id = $1 AND status = 'VERIFIED'
        `, [studentId]);
        const paidAmount = parseFloat(paidRes.rows[0].paid);

        const result = await query(`
            INSERT INTO student_finance_profiles 
            (student_id, partnership_id, payment_plan, base_amount, discount_amount, total_amount_due, remaining_balance, is_fully_paid)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (student_id) DO UPDATE SET
                partnership_id = EXCLUDED.partnership_id,
                payment_plan = EXCLUDED.payment_plan,
                base_amount = EXCLUDED.base_amount,
                discount_amount = EXCLUDED.discount_amount,
                total_amount_due = EXCLUDED.total_amount_due,
                remaining_balance = EXCLUDED.total_amount_due - $9,
                is_fully_paid = (EXCLUDED.total_amount_due - $9 <= 0)
            RETURNING *
        `, [studentId, partnershipId, plan, base_amount, discount_amount, total_amount_due, total_amount_due - paidAmount, total_amount_due - paidAmount <= 0, paidAmount]);

        return result.rows[0];
    }

    // 6. Bulk sync all students in a department (used when department price changes)
    static async syncDepartmentTuition(departmentId) {
        const result = await query(`
            SELECT s.id 
            FROM students s 
            JOIN specialities sp ON s.speciality_id = sp.id 
            WHERE sp.department_id = $1 AND s.deleted_at IS NULL
        `, [departmentId]);

        const promises = result.rows.map(student =>
            this.updateFinanceProfile(student.id, null, undefined)
        );

        return await Promise.all(promises);
    }

    // 7. Same for speciality
    static async syncSpecialityTuition(specialityId) {
        const result = await query(`
            SELECT id FROM students WHERE speciality_id = $1 AND deleted_at IS NULL
        `, [specialityId]);

        const promises = result.rows.map(student =>
            this.updateFinanceProfile(student.id, null, undefined)
        );

        return await Promise.all(promises);
    }

    // 8. Management: Partnerships
    static async getPartnerships() {
        const result = await query('SELECT * FROM partnerships ORDER BY company_name ASC');
        return result.rows;
    }

    static async createPartnership(data) {
        const { company_name, discount_percentage, contact_info } = data;
        const result = await query(`
            INSERT INTO partnerships (company_name, discount_percentage, contact_info)
            VALUES ($1, $2, $3)
            RETURNING *
        `, [company_name, discount_percentage || 20.00, contact_info]);
        return result.rows[0];
    }
}

module.exports = Finance;
