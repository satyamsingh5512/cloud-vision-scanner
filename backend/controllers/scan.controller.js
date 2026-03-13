const prisma = require('../config/db');

const parseRawQrPayload = (rawText) => {
  if (!rawText || typeof rawText !== 'string') return null;

  const trimmed = rawText.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    if (!trimmed.startsWith('{') && trimmed.includes(':')) {
      try {
        return JSON.parse(`{${trimmed}}`);
      } catch {
        return null;
      }
    }
  }

  return null;
};

// POST /api/scan/verify
const verifyScan = async (req, res) => {
  try {
    const { userId, qrData, rawText, sessionId = 'default-session', markedBy = 'scanner' } = req.body || {};

    const parsedFromRaw = parseRawQrPayload(rawText);
    const payload = (qrData && typeof qrData === 'object') ? qrData : parsedFromRaw;

    const ticketId = payload?.ticketId ? String(payload.ticketId).trim() : null;
    const orderId = payload?.orderId ? String(payload.orderId).trim() : null;
    const email = payload?.email ? String(payload.email).trim().toLowerCase() : null;

    const derivedUserId = userId || email;
    const effectiveSessionId = payload?.event && payload?.date
      ? `${payload.event}-${payload.date}`
      : sessionId;

    if (!derivedUserId && !payload) {
      return res.status(400).json({ status: 'ERROR', message: 'Invalid QR data. userId/ticketId/orderId/email is required' });
    }

    if (payload) {
      if (!email) {
        return res.status(400).json({
          status: 'ERROR',
          message: 'Invalid QR data. email is required for ticket verification',
        });
      }

      const existingTicketRecord = await prisma.attendance.findFirst({
        where: { userId: email, sessionId: effectiveSessionId }
      });

      if (existingTicketRecord) {
        return res.status(200).json({
          status: 'ALREADY_MARKED',
          message: 'Attendance already marked for this ticket/session',
          user: {
            name: payload.name || 'Unknown',
            email: payload.email || null,
            phone: payload.phone || null,
            rollno: payload.rollno || null,
            event: payload.event || null,
            date: payload.date || null,
            time: payload.time || null,
            venue: payload.venue || null,
            ticketId,
            paymentId: payload.paymentId || null,
            orderId,
            amount: payload.amount || null,
            type: payload.type || null,
            group: payload.event || 'Ticket'
          },
          markedAt: existingTicketRecord.scannedAt,
        });
      }

      const ticketRecord = await prisma.attendance.create({
        data: {
          userId: email,
          name: payload.name || 'Unknown',
          group: payload.event || 'Ticket',
          sessionId: effectiveSessionId,
          markedBy,
          scannedAt: new Date(),
        }
      });

      return res.status(200).json({
        status: 'SUCCESS',
        message: 'Ticket verified and attendance marked',
        user: {
          name: payload.name || 'Unknown',
          email: payload.email || null,
          phone: payload.phone || null,
          rollno: payload.rollno || null,
          event: payload.event || null,
          date: payload.date || null,
          time: payload.time || null,
          venue: payload.venue || null,
          ticketId,
          paymentId: payload.paymentId || null,
          orderId,
          amount: payload.amount || null,
          type: payload.type || null,
          group: payload.event || 'Ticket'
        },
        markedAt: ticketRecord.scannedAt,
      });
    }

    // Step 1: Look up user in DB by userId
    const user = await prisma.user.findFirst({
      where: { userId: derivedUserId, isActive: true }
    });

    if (!user) {
      return res.status(200).json({
        status: 'NOT_REGISTERED',
        message: 'User not found in the database',
      });
    }

    // Step 2: Check for duplicate attendance in this session
    const existingRecord = await prisma.attendance.findFirst({
      where: { userId: user.userId, sessionId: effectiveSessionId }
    });

    if (existingRecord) {
      return res.status(200).json({
        status: 'ALREADY_MARKED',
        message: 'Attendance already marked for this session',
        user: {
          name: user.name,
          group: user.group,
          email: user.email,
          rollno: user.rollno,
          region: user.region,
        },
        markedAt: existingRecord.scannedAt,
      });
    }

    // Step 3: Mark attendance
    const record = await prisma.attendance.create({
      data: {
        userId: user.userId,
        name: user.name,
        group: user.group,
        sessionId: effectiveSessionId,
        markedBy,
        scannedAt: new Date(),
      }
    });

    return res.status(200).json({
      status: 'SUCCESS',
      message: 'Attendance marked successfully',
      user: {
        name: user.name,
        group: user.group,
        email: user.email,
        rollno: user.rollno,
        region: user.region,
        registeredAt: user.registeredAt,
      },
      markedAt: record.scannedAt,
    });
  } catch (err) {
    console.error('Scan verify error:', err);
    res.status(500).json({ status: 'ERROR', message: 'Server error' });
  }
};

module.exports = { verifyScan };
