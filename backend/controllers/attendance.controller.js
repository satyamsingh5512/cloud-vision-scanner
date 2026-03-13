const prisma = require('../config/db');

// GET /api/attendance
const getAllAttendance = async (req, res) => {
  try {
    const { group, sessionId, startDate, endDate, limit = 500 } = req.query;
    const where = {};

    if (group) where.group = group;
    if (sessionId) where.sessionId = sessionId;
    if (startDate || endDate) {
      where.scannedAt = {};
      if (startDate) where.scannedAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.scannedAt.lte = end;
      }
    }

    const records = await prisma.attendance.findMany({
      where,
      orderBy: { scannedAt: 'desc' },
      take: parseInt(limit)
    });

    res.json({ count: records.length, records });
  } catch (err) {
    console.error('Get attendance error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/attendance/session/:id
const getBySession = async (req, res) => {
  try {
    const records = await prisma.attendance.findMany({
      where: { sessionId: req.params.id },
      orderBy: { scannedAt: 'desc' }
    });
    res.json({ count: records.length, records });
  } catch (err) {
    console.error('Get by session error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/attendance/group/:group
const getByGroup = async (req, res) => {
  try {
    const records = await prisma.attendance.findMany({
      where: { group: req.params.group },
      orderBy: { scannedAt: 'desc' }
    });
    res.json({ count: records.length, records });
  } catch (err) {
    console.error('Get by group error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/attendance/stats
const getStats = async (req, res) => {
  try {
    const { sessionId } = req.query;
    const where = sessionId ? { sessionId } : {};

    const totalPresent = await prisma.attendance.count({ where });
    
    // Group stats using Prisma groupBy
    const groupStatsRaw = await prisma.attendance.groupBy({
      by: ['group'],
      where,
      _count: {
        group: true
      },
      orderBy: {
        group: 'asc'
      }
    });

    const groupStats = groupStatsRaw.map(item => ({
      _id: item.group,
      count: item._count.group
    }));

    res.json({ totalPresent, groupStats });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllAttendance, getBySession, getByGroup, getStats };
