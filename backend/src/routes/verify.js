const express = require('express');
const router = express.Router();
const DocumentService = require('../services/documentService');

// @desc    Verify a document via public code
// @route   GET /api/v1/verify/:code
// @access  Public
router.get('/:code', async (req, res) => {
    try {
        const verification = await DocumentService.verifyDocument(req.params.code);

        if (!verification) {
            return res.status(404).json({
                success: false,
                message: 'Invalid or revoked document verification code.'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                student: verification.student_name,
                registration: verification.registration_num,
                type: verification.document_type,
                speciality: verification.speciality_name,
                academic_year: verification.academic_year,
                issued_at: verification.issued_at,
                status: 'VERIFIED_AUTHENTIC'
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
