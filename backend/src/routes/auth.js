const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecuresecretkeysaap';

// Register
router.post('/register', async (req, res) => {
  const { email, phone, password, name, specialty, role, hospitalId } = req.body;

  if (!phone || !password || !name) {
    return res.status(400).json({ error: 'Name, phone, and password are required.' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({ error: 'Phone number already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: email || null,
        phone,
        password: hashedPassword,
        name,
        specialty: specialty || '',
        role: role || 'DOCTOR',
        hospitalId: hospitalId || 'tuth_01',
      },
    });

    // Auto-add to default chat rooms
    try {
      const defaultRooms = await prisma.chatRoom.findMany({
        where: {
          hospitalId: user.hospitalId,
          type: 'GROUP',
          name: { in: ['General Ward Channel', 'ICU Channel', 'OT Channel'] }
        }
      });
      for (const room of defaultRooms) {
        await prisma.chatRoomMember.create({
          data: {
            chatRoomId: room.id,
            userId: user.id
          }
        }).catch(err => console.log('Failed to add new user to default room:', err.message));
      }
    } catch (roomErr) {
      console.error('Error auto-adding user to default channels:', roomErr);
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, hospitalId: user.hospitalId, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        specialty: user.specialty,
        role: user.role,
        hospitalId: user.hospitalId,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ error: 'Phone and password are required.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid phone or password.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid phone or password.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, hospitalId: user.hospitalId, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        specialty: user.specialty,
        role: user.role,
        hospitalId: user.hospitalId,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// Profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { hospital: true },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      specialty: user.specialty,
      role: user.role,
      hospital: user.hospital,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching profile.' });
  }
});

module.exports = router;
