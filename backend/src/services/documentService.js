const { query } = require('../config/db');
const PDFGenerator = require('../utils/pdfGenerator');
const crypto = require('crypto');

class DocumentService {
    /**
     * Generate and finalize a certificate
     */
    static async generateCertificate(requestId) {
        // 1. Get certificate request and student details
        const result = await query(`
            SELECT cr.id as request_id, cr.type, cr.academic_year, cr.status,
                   s.id as student_id, s.registration_num, s.birth_date,
                   e.first_name || ' ' || e.last_name as student_name,
                   spec.name as speciality_name
            FROM certificate_requests cr
            JOIN students s ON cr.student_id = s.id
            JOIN users u ON s.user_id = u.id
            JOIN employees e ON u.id = e.user_id -- Assuming student is also a user/employee record for name
            -- Wait, students table has names? Let me check students table columns.
            JOIN specialities spec ON s.speciality_id = spec.id
            WHERE cr.id = $1
        `, [requestId]);

        // Correction: Students table likely has first_name, last_name too.
        // Let me verify student columns first.
        const studentCols = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'students'");
        const columns = studentCols.rows.map(r => r.column_name);

        let dataQuery = '';
        if (columns.includes('first_name')) {
            dataQuery = `
                SELECT cr.id as request_id, cr.type, cr.academic_year, cr.status,
                       s.id as student_id, s.registration_num, s.birth_date,
                       s.first_name || ' ' || s.last_name as student_name,
                       spec.name as speciality_name
                FROM certificate_requests cr
                JOIN students s ON cr.student_id = s.id
                JOIN specialities spec ON s.speciality_id = spec.id
                WHERE cr.id = $1
            `;
        } else {
            // Fallback to joining with users/employees if names are there
            dataQuery = `
                SELECT cr.id as request_id, cr.type, cr.academic_year, cr.status,
                       s.id as student_id, s.registration_num, s.birth_date,
                       u.email as student_name, -- Placeholder
                       spec.name as speciality_name
                FROM certificate_requests cr
                JOIN students s ON cr.student_id = s.id
                JOIN users u ON s.user_id = u.id
                JOIN specialities spec ON s.speciality_id = spec.id
                WHERE cr.id = $1
            `;
        }

        const dataResult = await query(dataQuery, [requestId]);
        const data = dataResult.rows[0];

        if (!data) throw new Error('Certificate request not found');

        // 2. Create or Get Verification Record
        let verification = (await query('SELECT * FROM document_verifications WHERE certificate_id = $1', [requestId])).rows[0];

        if (!verification) {
            const verificationCode = crypto.randomBytes(16).toString('hex');
            const insertRes = await query(`
                INSERT INTO document_verifications (certificate_id, student_id, verification_code, document_type)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `, [requestId, data.student_id, verificationCode, data.type]);
            verification = insertRes.rows[0];
        }

        // 3. Prepare generation data
        const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const verificationUrl = `${baseUrl}/verify/${verification.verification_code}`;

        const generationData = {
            ...data,
            verification_id: verification.id,
            verification_code: verification.verification_code
        };

        // 4. Generate PDF
        let pdfBuffer;
        if (data.type === 'Schooling Certificate') {
            pdfBuffer = await PDFGenerator.generateSchoolingCertificate(generationData, verificationUrl);
        } else {
            // Default to schooling for now or throw
            pdfBuffer = await PDFGenerator.generateSchoolingCertificate(generationData, verificationUrl);
        }

        return {
            buffer: pdfBuffer,
            fileName: `${data.type.replace(/\s+/g, '_')}_${data.registration_num}.pdf`
        };
    }

    /**
     * Verify a document by code
     */
    static async verifyDocument(code) {
        const result = await query(`
            SELECT dv.*, 
                   s.first_name || ' ' || s.last_name as student_name,
                   s.registration_num,
                   spec.name as speciality_name,
                   cr.academic_year
            FROM document_verifications dv
            JOIN students s ON dv.student_id = s.id
            JOIN specialities spec ON s.speciality_id = spec.id
            JOIN certificate_requests cr ON dv.certificate_id = cr.id
            WHERE dv.verification_code = $1 AND dv.is_revoked = FALSE
        `, [code]);

        return result.rows[0];
    }
}

module.exports = DocumentService;
