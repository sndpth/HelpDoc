const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const prisma = new PrismaClient();

// Reusable audit logging helper — fire-and-forget, never throws
const logAudit = (userId, userName, action, resource, resourceId, patientId, details) => {
  prisma.auditLog.create({
    data: {
      userId,
      userName,
      action,
      resource,
      resourceId: resourceId || null,
      patientId: patientId || null,
      details: details || null
    }
  }).catch(err => {
    console.error('Audit log write failed:', err.message);
  });
};

// GET /api/audit — Paginated audit log viewer
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { patientId, userId, action, limit } = req.query;
    const take = parseInt(limit) || 100;

    const where = {};
    if (patientId) where.patientId = patientId;
    if (userId) where.userId = userId;
    if (action) where.action = action;

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take
    });

    res.json(logs);
  } catch (error) {
    console.error('Fetch audit logs error:', error);
    res.status(500).json({ error: 'Server error fetching audit logs.' });
  }
});

// GET /api/audit/patient/:recordID — Patient-specific audit trail
router.get('/patient/:recordID', authenticateToken, async (req, res) => {
  try {
    const { recordID } = req.params;

    const logs = await prisma.auditLog.findMany({
      where: { patientId: recordID },
      orderBy: { createdAt: 'desc' }
    });

    res.json(logs);
  } catch (error) {
    console.error('Fetch patient audit logs error:', error);
    res.status(500).json({ error: 'Server error fetching patient audit logs.' });
  }
});

module.exports = { router, logAudit };
