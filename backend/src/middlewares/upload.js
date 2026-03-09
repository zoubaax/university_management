const multer = require('multer');
const path = require('path');
const ErrorResponse = require('../utils/ErrorResponse');
const fs = require('fs');

// Set Storage Engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folder = 'public/uploads/others';
        if (file.fieldname === 'attachment') folder = 'public/uploads/absences';
        if (file.fieldname === 'bac_document' || file.fieldname === 'cin_document') folder = 'public/uploads/students';
        if (file.fieldname === 'resource') folder = 'public/uploads/resources';
        if (file.fieldname === 'club_logo') folder = 'public/uploads/clubs';
        if (file.fieldname === 'image') folder = 'public/uploads/gallery';
        if (file.fieldname === 'meal_photo') folder = 'public/uploads/cafeteria';

        // Create folder if it doesn't exist
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
        }

        cb(null, folder);
    },
    filename: function (req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Check File Type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|pdf|docx|doc|pptx|ppt|xls|xlsx|zip|rar|txt|mp4|mov/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    // For binary files, mimetype check might be complex, so we primarily trust ext for now or expand mime list
    const mimetype = true; // simplifying for academic resources to allow docs/vids

    if (extname) {
        return cb(null, true);
    } else {
        cb(new ErrorResponse('Error: File type not supported!', 400));
    }
}

// Init Upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for courses/vids
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

module.exports = upload;
