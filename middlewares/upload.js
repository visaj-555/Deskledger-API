const multer = require('multer');
const path = require('path');

// Configure multer storage options
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/profile_images');
    },
    filename: function (req, file, cb) {

      cb(null, `${Date.now()}_${file.originalname}`);
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
    }
});

module.exports = { upload };
