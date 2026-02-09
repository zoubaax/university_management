const multer = require('multer');
const path = require('path');
const ErrorResponse = require('../utils/ErrorResponse');

// Set Storage Engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folder = 'public/uploads/others';
        if (file.fieldname === 'attachment') folder = 'public/uploads/absences';
        if (file.fieldname === 'bac_document' || file.fieldname === 'cin_document') folder = 'public/uploads/students';

        cb(null, folder);
    },
    filename: function (req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Check File Type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|pdf/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new ErrorResponse('Error: Images or PDFs Only!', 400));
    }
}

// Init Upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

module.exports = upload;
