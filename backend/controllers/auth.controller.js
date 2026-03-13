const jwt = require('jsonwebtoken');

// In-memory admin (no DB needed for single admin setup)
// Credentials read from .env
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@qr.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const emailNormalized = String(email).trim().toLowerCase();
    const adminEmailNormalized = String(adminEmail).trim().toLowerCase();
    const passwordNormalized = String(password).trim();
    const adminPasswordNormalized = String(adminPassword).trim();

    if (emailNormalized !== adminEmailNormalized || passwordNormalized !== adminPasswordNormalized) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { email: adminEmail, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      admin: { email: adminEmail, role: 'admin' },
    });
  } catch (err) {
    console.error('Auth login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { adminLogin };
