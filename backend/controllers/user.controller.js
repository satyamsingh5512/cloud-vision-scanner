const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const fs = require('fs');
const csv = require('csv-parser');
const prisma = require('../config/db');

// POST /api/users/register
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, group, rollno, region } = req.body;

    if (!name || !email || !group) {
      return res.status(400).json({ message: 'Name, email, and group are required' });
    }

    const emailLower = email.toLowerCase();

    // Check if email or rollno already registered
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailLower },
          { rollno: rollno || undefined }
        ].filter(Boolean)
      }
    });

    if (existing) {
      const field = existing.email === emailLower ? 'Email' : 'Roll number';
      return res.status(409).json({ message: `User with this ${field} already exists` });
    }

    // Generate UUID for QR encoding
    const userId = uuidv4();

    // Generate QR code as base64 data URI (encodes only the UUID)
    const qrCode = await QRCode.toDataURL(userId, {
      errorCorrectionLevel: 'H',
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });

    const user = await prisma.user.create({
      data: {
        userId,
        name,
        email: emailLower,
        phone,
        rollno,
        group,
        region,
        qrCode
      }
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        rollno: user.rollno,
        group: user.group,
        region: user.region,
        qrCode: user.qrCode,
        registeredAt: user.registeredAt,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    console.error('Register user error:', err);
    // Prisma unique constraint error code P2002
    if (err.code === 'P2002') {
      return res.status(409).json({ message: 'Email or userId already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        userId: true,
        name: true,
        email: true,
        phone: true,
        rollno: true,
        group: true,
        region: true,
        registeredAt: true,
        isActive: true,
      },
      orderBy: {
        registeredAt: 'desc'
      }
    });
    res.json({ count: users.length, users });
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/users/:userId
const getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { userId: req.params.userId }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('Get user by ID error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/users/:userId
const deleteUser = async (req, res) => {
  try {
    await prisma.user.delete({
      where: { userId: req.params.userId }
    });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/users
const deleteAllUsers = async (req, res) => {
  try {
    const result = await prisma.user.deleteMany();
    res.json({ message: 'All users deleted successfully', deletedCount: result.count });
  } catch (err) {
    console.error('Delete all users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/users/bulk-upload
const bulkUploadUsers = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a CSV file' });
  }

  const results = [];
  const errors = [];
  let processedCount = 0;

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        for (const row of results) {
          const { name, email, group, phone, rollno, region } = row;

          if (!name || !email || !group) {
            errors.push({ row, error: 'Missing required fields' });
            continue;
          }

          const emailLower = email.toLowerCase().trim();

          try {
            // Check if user already exists by email or rollno
            const existing = await prisma.user.findFirst({
              where: {
                OR: [
                  { email: emailLower },
                  { rollno: rollno ? rollno.trim() : undefined }
                ].filter(Boolean)
              }
            });
            
            if (existing) {
              const field = existing.email === emailLower ? 'email' : 'rollno';
              errors.push({ row, error: `User with this ${field} already exists` });
              continue;
            }

            // Generate UUID for fallback/internal use
            const userId = uuidv4();
            
            // Generate QR code using userId
            const qrCode = await QRCode.toDataURL(userId, {
              errorCorrectionLevel: 'H',
              margin: 2,
              color: { dark: '#000000', light: '#ffffff' },
            });

            await prisma.user.create({
              data: {
                userId,
                name: name.trim(),
                email: emailLower,
                phone: phone ? phone.trim() : null,
                rollno: rollno ? rollno.trim() : null,
                group: group.trim(),
                region: region ? region.trim() : null,
                qrCode
              }
            });
            processedCount++;
          } catch (innerErr) {
            console.error('Error processing row:', innerErr);
            errors.push({ row, error: innerErr.message });
          }
        }

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.status(200).json({
          message: `Bulk upload completed. ${processedCount} users added.`,
          processedCount,
          errorCount: errors.length,
          errors: errors.slice(0, 10), // Return first 10 errors for feedback
        });
      } catch (err) {
        console.error('Bulk upload processing error:', err);
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Error processing bulk upload' });
      }
    })
    .on('error', (err) => {
      console.error('CSV parse error:', err);
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      res.status(500).json({ message: 'Error reading CSV file' });
    });
};

module.exports = { registerUser, getAllUsers, getUserById, deleteUser, deleteAllUsers, bulkUploadUsers };
