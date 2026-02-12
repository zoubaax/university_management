const express = require('express');
const {
    requestCertificate,
    getMyRequests,
    getDepartmentRequests,
    processRequest,
    getCertificateDetails
} = require('../controllers/certificate');

const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');

router.use(protect);

router.post('/request', authorize('STUDENT'), requestCertificate);
router.get('/my-requests', authorize('STUDENT'), getMyRequests);
router.get('/department-requests', authorize('RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'SUPER_ADMIN'), getDepartmentRequests);
router.put('/process/:id', authorize('RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'SUPER_ADMIN'), processRequest);
router.get('/details/:id', getCertificateDetails);

module.exports = router;
