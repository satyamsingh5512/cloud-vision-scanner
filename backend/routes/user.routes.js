const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { registerUser, getAllUsers, getUserById, updateUser, deleteUser, deleteAllUsers, bulkUploadUsers } = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

const uploadDir = process.env.UPLOAD_DIR || path.join(os.tmpdir(), 'event-scanner-uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup for temporary file storage
const upload = multer({ 
  dest: uploadDir,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// Public: get a specific user by ID (needed for scan display — no sensitive data returned)
router.get('/:userId', getUserById);

// Admin-protected routes
router.post('/register', authMiddleware, registerUser);
router.post('/bulk-upload', authMiddleware, upload.single('file'), bulkUploadUsers);
router.get('/', authMiddleware, getAllUsers);
router.delete('/', authMiddleware, deleteAllUsers);
router.put('/:userId', authMiddleware, updateUser);
router.delete('/:userId', authMiddleware, deleteUser);

module.exports = router;
