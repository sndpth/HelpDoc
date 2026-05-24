const http = require('http');
const socketIo = require('socket.io');

const PORT = 3000;
const server = http.createServer();
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

console.log('DoctorSaap Clinical Relay Server starting...');

io.on('connection', (socket) => {
  console.log('New clinician connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`Clinician ${userId} joined their secure channel`);
  });

  socket.on('message', (data) => {
    // data: { to: 'receiverId', from: 'senderId', text: '...', senderName: '...' }
    console.log(`Relaying clinical message from ${data.from} to ${data.to}`);
    io.to(data.to).emit('message', data);
  });

  socket.on('share_emr', (data) => {
    // data: { to: 'receiverId', from: 'senderId', patient: {...}, senderName: '...' }
    console.log(`Relaying EMR record share from ${data.from} to ${data.to}`);
    io.to(data.to).emit('share_emr', data);
  });

  socket.on('disconnect', () => {
    console.log('Clinician disconnected');
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Relay server running on http://0.0.0.0:${PORT}`);
  console.log(`IMPORTANT: Ensure your mobile devices are on the same Wi-Fi network.`);
});
