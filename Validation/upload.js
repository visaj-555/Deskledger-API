const multer = require('multer');
const path = require('path');
const { statusCode, message } = require('../utils/api.response');

// Configure multer storage options
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/profile_images'); // Set the upload path
    },
    filename: function (req, file, cb) {
        const firstName = req.body.firstName; // Access firstName from the request body
        if (firstName) {
            // Store image with firstName and current timestamp to ensure uniqueness
            cb(null, `${firstName}_${Date.now()}${path.extname(file.originalname)}`);
        } else {
            // Default to timestamp if firstName is not provided
            cb(null, `${Date.now()}_${file.originalname}`);
        }
    }
});

// Initialize multer with storage options
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            req.fileValidationError = 'Only .jpeg, .jpg, and .png files are allowed!';
            return cb(null, false, new Error('Only .jpeg, .jpg, and .png files are allowed!'));
        }
    },
    limits: { fileSize: 1 * 1024 * 1024 } // Limit file size to 1 MB
});

// Error handling middleware for file size limit
function multerErrorHandling(err, req, res, next) {
    if (err.code === 'LIMIT_FILE_SIZE') {
        req.fileSizeLimitError = true;
        return res.status(statusCode.BAD_REQUEST).json({ message: message.validImageError });
    }
    next(err);
}

module.exports = { upload, multerErrorHandling };
