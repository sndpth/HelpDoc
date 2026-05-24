const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { logAudit } = require('./audit');

const prisma = new PrismaClient();

// PUT /api/hospital - Update hospital details (name, address, bedCapacity)
router.put('/', authenticateToken, async (req, res) => {
  const { name, address, bedCapacity } = req.body;
  const hospitalId = req.user.hospitalId;

  try {
    const updated = await prisma.hospital.update({
      where: { id: hospitalId },
      data: {
        name: name || undefined,
        address: address !== undefined ? address : undefined,
        bedCapacity: bedCapacity !== undefined ? parseInt(bedCapacity) : undefined
      }
    });

    // Log to Audit Trail
    logAudit(
      req.user.id,
      req.user.name,
      'UPDATE',
      'HOSPITAL',
      hospitalId,
      null,
      JSON.stringify({ name: updated.name, address: updated.address, bedCapacity: updated.bedCapacity })
    );

    res.json(updated);
  } catch (error) {
    console.error('Update hospital details error:', error);
    res.status(500).json({ error: 'Server error updating hospital details.' });
  }
});

module.exports = router;
