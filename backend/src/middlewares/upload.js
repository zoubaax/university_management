const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const ErrorResponse = require('../utils/ErrorResponse');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set Cloudinary Storage Engine
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        let folder = 'smart-upf/others';
        
        if (file.fieldname === 'attachment') folder = 'smart-upf/absences';
        if (file.fieldname === 'bac_document' || file.fieldname === 'cin_document') folder = 'smart-upf/students';
        if (file.fieldname === 'resource') folder = 'smart-upf/resources';
        if (file.fieldname === 'club_logo') folder = 'smart-upf/clubs';
        if (file.fieldname === 'image') folder = 'smart-upf/gallery';
        if (file.fieldname === 'meal_photo') folder = 'smart-upf/cafeteria';

        // Allowed formats
        const filetypes = /jpeg|jpg|png|pdf|docx|doc|pptx|ppt|xls|xlsx|zip|rar|txt|mp4|mov/;
        const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
        
        return {
            folder: folder,
            resource_type: 'auto', // Cloudinary will automatically detect if it's an image, video, or raw file
            public_id: `${file.fieldname}-${Date.now()}`,
            format: ext === 'pdf' ? 'pdf' : undefined // specifically handle pdf if needed, else auto
        };
    },
});

// Init Upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB for courses/vids
});

module.exports = upload;
