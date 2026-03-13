const prisma = require('../config/db');

// GET /api/attendance
const getAllAttendance = async (req, res) => {
  try {
    const { group, sessionId, startDate, endDate, q, limit = 500 } = req.query;
    const where = {};

    if (group) where.group = group;
    if (sessionId) where.sessionId = sessionId;
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { userId: { contains: q, mode: 'insensitive' } },
        { group: { contains: q, mode: 'insensitive' } },
        { sessionId: { contains: q, mode: 'insensitive' } },
      ];
    }
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

// PUT /api/attendance/:id
const updateAttendance = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: 'Invalid attendance id' });
    }

    const { name, group, sessionId, markedBy } = req.body;
    const data = {};
    if (name !== undefined) data.name = String(name).trim();
    if (group !== undefined) data.group = String(group).trim();
    if (sessionId !== undefined) data.sessionId = String(sessionId).trim();
    if (markedBy !== undefined) data.markedBy = String(markedBy).trim();

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'No update fields provided' });
    }

    const record = await prisma.attendance.update({
      where: { id },
      data,
    });

    res.json({ message: 'Attendance updated successfully', record });
  } catch (err) {
    console.error('Update attendance error:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/attendance/:id
const deleteAttendance = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: 'Invalid attendance id' });
    }

    await prisma.attendance.delete({ where: { id } });
    res.json({ message: 'Attendance record removed successfully' });
  } catch (err) {
    console.error('Delete attendance error:', err);
    if (err.code === 'P2025') {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
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

module.exports = { getAllAttendance, updateAttendance, deleteAttendance, getBySession, getByGroup, getStats };
