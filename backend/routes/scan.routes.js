const express = require('express');
const router = express.Router();
const { verifyScan } = require('../controllers/scan.controller');
const { scanRateLimit } = require('../middleware/rateLimit.middleware');

// Public route — scanners don't need to be logged in
router.post('/verify', scanRateLimit, verifyScan);

module.exports = router;
