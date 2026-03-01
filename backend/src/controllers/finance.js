const Finance = require('../models/Finance');
const { query } = require('../config/db');

// @desc    Get finance overview stats
// @route   GET /api/v1/finance/stats
// @access  Private (Financier/Admin)
exports.getStats = async (req, res, next) => {
    try {
        const stats = await Finance.getStats();
        res.status(200).json({ success: true, data: stats });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all student finance profiles
// @route   GET /api/v1/finance/students
// @access  Private (Financier/Admin)
exports.getStudentProfiles = async (req, res, next) => {
    try {
        const filters = {
            hasDebt: req.query.hasDebt === 'true'
        };
        const profiles = await Finance.getStudentProfiles(filters);
        res.status(200).json({ success: true, count: profiles.length, data: profiles });
    } catch (err) {
        next(err);
    }
};

// @desc    Get recent payments
// @route   GET /api/v1/finance/payments
// @access  Private (Financier/Admin)
exports.getPayments = async (req, res, next) => {
    try {
        const result = await query(`
            SELECT 
                fp.*, 
                s.first_name as student_first_name, 
                s.last_name as student_last_name
            FROM finance_payments fp
            JOIN students s ON fp.student_id = s.id
            ORDER BY fp.created_at DESC
            LIMIT 50
        `);
        res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
    } catch (err) {
        next(err);
    }
};

// @desc    Record a new payment
// @route   POST /api/v1/finance/payments
// @access  Private (Financier/Admin)
exports.createPayment = async (req, res, next) => {
    try {
        const paymentData = {
            ...req.body,
            verified_by: req.user.id
        };
        const payment = await Finance.createPayment(paymentData);

        // Notify Student
        try {
            const Notification = require('../models/Notification');
            const studentRes = await query('SELECT user_id, first_name FROM students WHERE id = $1', [req.body.student_id]);
            if (studentRes.rows[0]) {
                await Notification.create({
                    user_id: studentRes.rows[0].user_id,
                    type: 'general',
                    title: 'Payment Recorded',
                    message: `A payment of ${req.body.amount} MAD has been recorded to your account via ${req.body.payment_method}.`,
                    link: '/finance'
                });
            }
        } catch (warn) {
            console.warn('Notification failed:', warn.message);
        }

        res.status(201).json({ success: true, data: payment });
    } catch (err) {
        next(err);
    }
};

// @desc    Verify a payment (Check/Transfer)
// @route   PUT /api/v1/finance/payments/:id/verify
// @access  Private (Financier/Admin)
exports.verifyPayment = async (req, res, next) => {
    try {
        const payment = await Finance.verifyPayment(req.params.id, req.user.id);

        // Notify Student
        try {
            const Notification = require('../models/Notification');
            const studentRes = await query('SELECT user_id FROM students WHERE id = $1', [payment.student_id]);
            if (studentRes.rows[0]) {
                await Notification.create({
                    user_id: studentRes.rows[0].user_id,
                    type: 'general',
                    title: 'Payment Verified',
                    message: `Your payment of ${payment.amount} MAD has been verified.`,
                    link: '/finance'
                });
            }
        } catch (warn) {
            console.warn('Notification failed:', warn.message);
        }

        res.status(200).json({ success: true, data: payment });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all partnerships
// @route   GET /api/v1/finance/partnerships
// @access  Private (Financier/Admin)
exports.getPartnerships = async (req, res, next) => {
    try {
        const result = await query('SELECT * FROM partnerships WHERE is_active = TRUE ORDER BY company_name');
        res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
        next(err);
    }
};

// @desc    Update student finance profile (plan/partner)
// @route   PUT /api/v1/finance/students/:id/profile
// @access  Private (Financier/Admin)
exports.updateProfile = async (req, res, next) => {
    try {
        const { payment_plan, partnership_id } = req.body;
        const profile = await Finance.updateFinanceProfile(req.params.id, payment_plan, partnership_id);
        res.status(200).json({ success: true, data: profile });
    } catch (err) {
        next(err);
    }
};

// @desc    Create a new partnership
// @route   POST /api/v1/finance/partnerships
// @access  Private (Financier/Admin)
exports.createPartnership = async (req, res, next) => {
    try {
        const partnership = await Finance.createPartnership(req.body);
        res.status(201).json({ success: true, data: partnership });
    } catch (err) {
        next(err);
    }
};

// @desc    Download payment receipt as PDF
// @route   GET /api/v1/finance/payments/:id/receipt
// @access  Private (Financier/Admin, Student)
exports.getPaymentReceipt = async (req, res, next) => {
    try {
        const PDFDocument = require('pdfkit');

        // Fetch payment and student details
        const paymentRes = await query(`
            SELECT 
                fp.*, 
                s.first_name, 
                s.last_name, 
                sp.name as speciality_name,
                sfp.remaining_balance,
                sfp.total_amount_due
            FROM finance_payments fp
            JOIN students s ON fp.student_id = s.id
            JOIN specialities sp ON s.speciality_id = sp.id
            LEFT JOIN student_finance_profiles sfp ON s.id = sfp.student_id
            WHERE fp.id = $1
        `, [req.params.id]);

        const payment = paymentRes.rows[0];

        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        // Verify access: Student can only see their own receipts
        if (req.user.role_name === 'STUDENT') {
            const studentCheck = await query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
            if (!studentCheck.rows[0] || studentCheck.rows[0].id !== payment.student_id) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }
        }

        // Initialize PDF creation
        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        // Setup headers for PDF streaming
        res.setHeader('Content-disposition', `attachment; filename="smart_upf_receipt_${payment.id.substring(0, 8)}.pdf"`);
        res.setHeader('Content-type', 'application/pdf');
        doc.pipe(res);

        // --- PDF Content ---

        // Header Background
        doc.rect(0, 0, doc.page.width, 100).fill('#1f2937'); // Gray-800

        // Header Text
        doc.fillColor('#ffffff')
            .fontSize(24)
            .font('Helvetica-Bold')
            .text('SMART UPF', 50, 40)
            .fontSize(10)
            .font('Helvetica')
            .text('OFFICIAL PAYMENT RECEIPT', 50, 70);

        // Date and Info
        doc.fillColor('#6b7280') // Gray-500
            .fontSize(10)
            .text('Date Issued:', doc.page.width - 200, 40)
            .text('Receipt #:', doc.page.width - 200, 55)
            .text('Status:', doc.page.width - 200, 70);

        doc.fillColor('#ffffff')
            .font('Helvetica-Bold')
            .text(new Date().toLocaleDateString(), doc.page.width - 130, 40)
            .text(payment.id.substring(0, 8).toUpperCase(), doc.page.width - 130, 55)
            .text(payment.status, doc.page.width - 130, 70);

        doc.moveDown(4);

        // Student Info Box
        doc.fillColor('#111827').fontSize(14).font('Helvetica-Bold').text('Student Details', 50, 140);
        doc.rect(50, 160, doc.page.width - 100, 70).fillAndStroke('#f9fafb', '#e5e7eb');

        doc.fillColor('#374151').fontSize(10).font('Helvetica-Bold')
            .text('Name:', 60, 175).font('Helvetica').text(`${payment.first_name} ${payment.last_name}`, 130, 175)
            .font('Helvetica-Bold').text('Speciality:', 60, 195).font('Helvetica').text(payment.speciality_name, 130, 195)
            .font('Helvetica-Bold').text('Student ID:', 60, 215).font('Helvetica').text(payment.student_id, 130, 215);

        // Payment Details Box
        doc.fillColor('#111827').fontSize(14).font('Helvetica-Bold').text('Payment Details', 50, 260);
        doc.rect(50, 280, doc.page.width - 100, 80).fillAndStroke('#f9fafb', '#e5e7eb');

        doc.fillColor('#374151').fontSize(10).font('Helvetica-Bold')
            .text('Date of Payment:', 60, 295).font('Helvetica').text(new Date(payment.created_at).toLocaleDateString(), 180, 295)
            .font('Helvetica-Bold').text('Payment Method:', 60, 315).font('Helvetica').text(payment.payment_method, 180, 315)
            .font('Helvetica-Bold').text('Amount Received:', 60, 335).font('Helvetica-Bold').fillColor('#10b981').text(`${parseFloat(payment.amount).toLocaleString()} MAD`, 180, 335);

        if (payment.payment_method !== 'CASH') {
            doc.fillColor('#374151').font('Helvetica-Bold').text('Bank / Ref:', 300, 315).font('Helvetica').text(`${payment.bank_name || 'N/A'} - ${payment.check_number || 'N/A'}`, 380, 315);
        }

        // Account Summary Box
        doc.fillColor('#111827').fontSize(14).font('Helvetica-Bold').text('Financial Summary', 50, 390);

        doc.rect(50, 410, (doc.page.width - 110) / 2, 60).fillAndStroke('#fefce8', '#fef08a'); // Yellow bg for Total Data
        doc.rect((doc.page.width - 110) / 2 + 60, 410, (doc.page.width - 110) / 2, 60).fillAndStroke('#eff6ff', '#bfdbfe'); // Blue bg for Remaining

        doc.fillColor('#854d0e').fontSize(10).font('Helvetica-Bold').text('Total App. Fees:', 60, 425);
        doc.fontSize(14).text(`${parseFloat(payment.total_amount_due).toLocaleString()} MAD`, 60, 445);

        doc.fillColor('#1e40af').fontSize(10).font('Helvetica-Bold').text('Remaining Balance:', (doc.page.width - 110) / 2 + 70, 425);
        doc.fontSize(14).text(`${parseFloat(payment.remaining_balance).toLocaleString()} MAD`, (doc.page.width - 110) / 2 + 70, 445);

        // Footer
        doc.moveDown(5);
        doc.rect(50, doc.y, doc.page.width - 100, 1).fill('#e5e7eb');
        doc.moveDown(1);
        doc.fillColor('#9ca3af').fontSize(9).font('Helvetica')
            .text('This is an electronically generated receipt verified by SMART UPF.', { align: 'center' })
            .text('For any questions or concerns regarding your account balance, please contact our support desk.', { align: 'center' });

        doc.end();

    } catch (err) {
        next(err);
    }
};
