const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

const prisma = new PrismaClient();

// Dynamic Seeding check
async function seedDefaultHospital() {
  try {
    const count = await prisma.hospital.count();
    if (count === 0) {
      await prisma.hospital.create({
        data: {
          id: 'tuth_01',
          name: 'T.U. Teaching Hospital',
          address: 'Maharajgunj, Kathmandu, Nepal'
        }
      });
      console.log('Seeded default hospital: T.U. Teaching Hospital (tuth_01)');
    }
    
    // Seed default channels and ensure memberships
    await ensureDefaultRoomsAndMemberships();
  } catch (error) {
    console.error('Error seeding default hospital:', error);
  }
}

async function ensureDefaultRoomsAndMemberships() {
  try {
    const hospitalId = 'tuth_01';
    const defaultRoomNames = ['General Ward Channel', 'ICU Channel', 'OT Channel'];
    
    // Get all users in the hospital
    const allUsers = await prisma.user.findMany({
      where: { hospitalId }
    });
    
    for (const roomName of defaultRoomNames) {
      // Find or create default room
      let room = await prisma.chatRoom.findFirst({
        where: {
          name: roomName,
          type: 'GROUP',
          hospitalId
        }
      });
      
      if (!room) {
        room = await prisma.chatRoom.create({
          data: {
            name: roomName,
            type: 'GROUP',
            hospitalId
          }
        });
        console.log(`Created default room: ${roomName}`);
      }
      
      // Ensure all users are members of this room
      for (const user of allUsers) {
        const membership = await prisma.chatRoomMember.findFirst({
          where: {
            chatRoomId: room.id,
            userId: user.id
          }
        });
        
        if (!membership) {
          await prisma.chatRoomMember.create({
            data: {
              chatRoomId: room.id,
              userId: user.id
            }
          });
          console.log(`Added user ${user.name} to default room ${roomName}`);
        }
      }
    }
  } catch (error) {
    console.error('Error ensuring default rooms and memberships:', error);
  }
}

async function seedAll() {
  try {
    // 1. Seed Hospital
    const count = await prisma.hospital.count();
    if (count === 0) {
      await prisma.hospital.create({
        data: {
          id: 'tuth_01',
          name: 'T.U. Teaching Hospital',
          address: 'Maharajgunj, Kathmandu, Nepal'
        }
      });
      console.log('Seeded default hospital: T.U. Teaching Hospital (tuth_01)');
    }

    // 2. Seed Mock Doctors and Nurses
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('doctorsaap123', 10);
    
    const mockUsers = [
      { phone: '9851000000', name: 'Dr. Sandeep Bhandari', specialty: 'Cardiothoracic Surgery', role: 'DOCTOR' },
      { phone: '9851000001', name: 'Dr. Niraj Bam', specialty: 'Pulmonology', role: 'DOCTOR' },
      { phone: '9851000002', name: 'Dr. Susan Giri', specialty: 'General Surgery', role: 'DOCTOR' },
      { phone: '9851000003', name: 'Dr. Alok Pradhan', specialty: 'Orthopedics', role: 'DOCTOR' },
      { phone: '9851000010', name: 'Nurse Priya Thapa', specialty: 'General Ward', role: 'NURSE' },
      { phone: '9851000011', name: 'Nurse Sita Dahal', specialty: 'ICU', role: 'NURSE' },
      { phone: '9851000012', name: 'Nurse Ranjita KC', specialty: 'OT', role: 'NURSE' },
      { phone: '9851000013', name: 'Nurse Anupa Sen', specialty: 'General Ward', role: 'NURSE' }
    ];

    console.log('Checking and seeding mock users...');
    for (const u of mockUsers) {
      await prisma.user.upsert({
        where: { phone: u.phone },
        update: {
          name: u.name,
          specialty: u.specialty,
          role: u.role,
          hospitalId: 'tuth_01'
        },
        create: {
          phone: u.phone,
          password: hashedPassword,
          name: u.name,
          specialty: u.specialty,
          role: u.role,
          hospitalId: 'tuth_01'
        }
      });
    }

    // 3. Ensure rooms and memberships
    await ensureDefaultRoomsAndMemberships();

    // 4. Seed Patients if none exist
    const patientCount = await prisma.patient.count();
    if (patientCount === 0) {
      const { getDemoPatients } = require('./utils/demoData');
      const demoPatients = getDemoPatients('tuth_01');
      console.log(`Auto-seeding ${demoPatients.length} mock patients...`);
      for (const p of demoPatients) {
        await prisma.patient.create({
          data: p
        });
      }
    }
  } catch (error) {
    console.error('Error seeding all data:', error);
  }
}

seedAll();

// Middleware
app.use(cors());
app.use(express.json());

const fs = require('fs');
const path = require('path');
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Routes
const authRoutes = require('./routes/auth');
const patientRoutes = require('./routes/patients');
const chatRoutes = require('./routes/chats');
const { router: auditRoutes } = require('./routes/audit');
const analyticsRoutes = require('./routes/analytics');
const hospitalRoutes = require('./routes/hospital');

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/hospital', hospitalRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'DoctorSaap API' });
});

// Socket.IO Clinical Relay Integration
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
app.set('io', io);

console.log('DoctorSaap Combined API & Relay Server starting...');

io.on('connection', (socket) => {
  console.log('New clinician connected:', socket.id);

  // Join user's personal channel & all active chat rooms
  socket.on('join', async (userId) => {
    socket.join(userId);
    console.log(`Clinician ${userId} joined their secure channel`);

    try {
      const memberships = await prisma.chatRoomMember.findMany({
        where: { userId }
      });
      memberships.forEach(membership => {
        socket.join(membership.chatRoomId);
        console.log(`Clinician socket ${socket.id} dynamically joined ChatRoom ${membership.chatRoomId}`);
      });
    } catch (err) {
      console.error('Error auto-joining chat rooms for user:', userId, err);
    }
  });

  // Legacy single-cast text messaging relay
  socket.on('message', (data) => {
    console.log(`Relaying legacy clinical message from ${data.from} to ${data.to}`);
    io.to(data.to).emit('message', data);
  });

  // Legacy EMR sharing relay
  socket.on('share_emr', (data) => {
    console.log(`Relaying legacy EMR record share from ${data.from} to ${data.to}`);
    io.to(data.to).emit('share_emr', data);
  });

  // --- Phase 2 Room-Based WebSocket Events ---

  // Join a specific chat room
  socket.on('join_room', (chatRoomId) => {
    socket.join(chatRoomId);
    console.log(`Clinician socket ${socket.id} joined ChatRoom ${chatRoomId}`);
  });

  // Leave a specific chat room
  socket.on('leave_room', (chatRoomId) => {
    socket.leave(chatRoomId);
    console.log(`Clinician socket ${socket.id} left ChatRoom ${chatRoomId}`);
  });

  // Send a message to a specific room
  socket.on('send_room_message', async (data) => {
    // data: { chatRoomId, senderId, text, sharedPatientId, imageUri }
    console.log(`Room message received for room ${data.chatRoomId} from sender ${data.senderId}`);
    try {
      const newMsg = await prisma.message.create({
        data: {
          chatRoomId: data.chatRoomId,
          senderId: data.senderId,
          text: data.text || null,
          sharedPatientId: data.sharedPatientId || null,
          imageUri: data.imageUri || null
        },
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

      // Broadcast to everyone in the room (including sender to confirm delivery)
      io.to(data.chatRoomId).emit('new_room_message', newMsg);
    } catch (err) {
      console.error('Error processing room message:', err);
      socket.emit('message_error', { error: 'Failed to send message.' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Clinician disconnected');
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`DoctorSaap Server is running on port ${PORT}`);
});

module.exports = { ensureDefaultRoomsAndMemberships };
