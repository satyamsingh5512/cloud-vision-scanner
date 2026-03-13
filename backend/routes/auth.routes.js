const express = require('express');
const router = express.Router();
const { adminLogin } = require('../controllers/auth.controller');
const { authRateLimit } = require('../middleware/rateLimit.middleware');

router.post('/login', authRateLimit, adminLogin);

module.exports = router;
