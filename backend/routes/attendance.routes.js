const express = require('express');
const router = express.Router();
const { getAllAttendance, updateAttendance, deleteAttendance, getBySession, getByGroup, getStats } = require('../controllers/attendance.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All attendance routes are admin-protected
router.use(authMiddleware);

router.get('/', getAllAttendance);
router.put('/:id', updateAttendance);
router.delete('/:id', deleteAttendance);
router.get('/stats', getStats);
router.get('/session/:id', getBySession);
router.get('/group/:group', getByGroup);

module.exports = router;
