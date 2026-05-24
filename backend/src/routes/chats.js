const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const prisma = new PrismaClient();

// Helper to notify all room members of a new or updated room via socket
const emitRoomCreated = (req, room) => {
  try {
    const io = req.app.get('io');
    if (io && room && room.members) {
      room.members.forEach(member => {
        io.to(member.userId).emit('room_created', room);
      });
    }
  } catch (err) {
    console.error('Error emitting room_created socket event:', err);
  }
};

// Get all chat rooms the logged-in user belongs to
router.get('/', authenticateToken, async (req, res) => {
  try {
    const rooms = await prisma.chatRoom.findMany({
      where: {
        members: {
          some: {
            userId: req.user.id
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
                specialty: true
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(rooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching chat rooms.' });
  }
});

// Fetch messages for a specific chat room
router.get('/:id/messages', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const membership = await prisma.chatRoomMember.findFirst({
      where: { chatRoomId: id, userId: req.user.id }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Access denied. You are not a member of this room.' });
    }

    const messages = await prisma.message.findMany({
      where: { chatRoomId: id },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching messages.' });
  }
});

// Create a new group chat room
router.post('/group', authenticateToken, async (req, res) => {
  const { name, userIds } = req.body;

  if (!name || !userIds || !Array.isArray(userIds)) {
    return res.status(400).json({ error: 'Group name and userIds list are required.' });
  }

  try {
    const uniqueUserIds = Array.from(new Set([...userIds, req.user.id]));

    const newRoom = await prisma.chatRoom.create({
      data: {
        name,
        type: 'GROUP',
        hospitalId: req.user.hospitalId,
        members: {
          create: uniqueUserIds.map(userId => ({ userId }))
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
                specialty: true
              }
            }
          }
        },
        messages: true
      }
    });

    emitRoomCreated(req, newRoom);
    res.status(201).json(newRoom);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error creating group chat.' });
  }
});

// Create or get a direct chat room between two practitioners
router.post('/direct', authenticateToken, async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Target userId is required.' });
  }

  try {
    // Check if a direct room already exists between these two users
    let room = await prisma.chatRoom.findFirst({
      where: {
        type: 'DIRECT',
        hospitalId: req.user.hospitalId,
        AND: [
          { members: { some: { userId: req.user.id } } },
          { members: { some: { userId } } }
        ]
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
                specialty: true
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!room) {
      const targetUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!targetUser) {
        return res.status(404).json({ error: 'Practitioner not found.' });
      }

      room = await prisma.chatRoom.create({
        data: {
          type: 'DIRECT',
          name: null,
          hospitalId: req.user.hospitalId,
          members: {
            create: [
              { userId: req.user.id },
              { userId }
            ]
          }
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                  specialty: true
                }
              }
            }
          },
          messages: true
        }
      });
      emitRoomCreated(req, room);
    }

    res.json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error opening direct chat.' });
  }
});

// Get or create a patient discussion thread
router.post('/patient/:patientId', authenticateToken, async (req, res) => {
  const { patientId } = req.params;

  try {
    const patient = await prisma.patient.findFirst({
      where: { recordID: patientId, hospitalId: req.user.hospitalId }
    });

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found.' });
    }

    let room = await prisma.chatRoom.findFirst({
      where: {
        type: 'PATIENT',
        patientId,
        hospitalId: req.user.hospitalId
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
                specialty: true
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!room) {
      room = await prisma.chatRoom.create({
        data: {
          name: `${patient.fullName} Case Discussion`,
          type: 'PATIENT',
          patientId,
          hospitalId: req.user.hospitalId,
          members: {
            create: { userId: req.user.id }
          }
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                  specialty: true
                }
              }
            }
          },
          messages: true
        }
      });
      emitRoomCreated(req, room);
    } else {
      // Automatically add current user to the patient discussion if not already in
      const isMember = room.members.some(m => m.userId === req.user.id);
      if (!isMember) {
        await prisma.chatRoomMember.create({
          data: {
            chatRoomId: room.id,
            userId: req.user.id
          }
        });
        
        // Refetch room with membership update
        room = await prisma.chatRoom.findUnique({
          where: { id: room.id },
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    role: true,
                    specialty: true
                  }
                }
              }
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        });
        emitRoomCreated(req, room);
      }
    }

    res.json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error getting patient discussion thread.' });
  }
});

// Fetch all practitioners in the clinician's hospital
router.get('/practitioners', authenticateToken, async (req, res) => {
  try {
    const practitioners = await prisma.user.findMany({
      where: {
        hospitalId: req.user.hospitalId,
        id: { not: req.user.id }
      },
      select: {
        id: true,
        name: true,
        role: true,
        specialty: true,
        phone: true
      },
      orderBy: { name: 'asc' }
    });

    res.json(practitioners);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching practitioners.' });
  }
});

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'chat-media-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Upload route for chat media files
router.post('/upload', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, fileUrl });
  } catch (err) {
    console.error('File upload error:', err);
    res.status(500).json({ error: 'Server error processing file upload.' });
  }
});

module.exports = router;
