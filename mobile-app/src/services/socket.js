import io from 'socket.io-client';
import useStore from '../store/useStore';
import Constants from 'expo-constants';

let socket;

export const initSocket = (serverUrl) => {
  if (socket) socket.disconnect();

  let url = serverUrl;
  if (!url) {
    const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
    const ip = hostUri ? hostUri.split(':')[0] : 'localhost';
    url = `http://${ip}:3000`;
  }

  console.log('Initializing socket connection to:', url);
  socket = io(url);

  const { userProfile, addMessage } = useStore.getState();

  socket.on('connect', () => {
    console.log('Connected to relay server');
    socket.emit('join', userProfile.id);
    useStore.getState().syncOfflineQueue();
  });

  socket.on('message', (data) => {
    addMessage(data.from, {
      text: data.text,
      sender: data.senderName,
      isMine: false,
    });
  });

  socket.on('share_emr', (data) => {
    addMessage(data.from, {
      text: `Shared EMR: ${data.patient.fullName}`,
      sender: data.senderName,
      isMine: false,
      sharedRecord: data.patient,
    });
  });

  // --- Phase 2 Room-Based Listeners ---
  socket.on('new_room_message', (msg) => {
    // msg: { id, chatRoomId, senderId, text, sharedPatientId, imageUri, createdAt, sender: { id, name } }
    const state = useStore.getState();
    const isMine = msg.senderId === state.userProfile?.id;

    // Resolve shared patient record if included
    const sharedRecord = msg.sharedPatientId
      ? state.patients.find(p => p.recordID === msg.sharedPatientId)
      : null;

    state.addRoomMessage(msg.chatRoomId, {
      id: msg.id,
      text: msg.text,
      sender: msg.sender.name,
      senderId: msg.senderId,
      isMine,
      sharedRecord,
      imageUri: msg.imageUri,
      createdAt: msg.createdAt
    });

    // Handle notifications / unread badge counter increments
    if (state.activeChatRoomId !== msg.chatRoomId && !isMine) {
      state.incrementUnread(msg.chatRoomId);
    }
  });

  socket.on('room_created', (room) => {
    console.log('New chat room received remotely:', room.name || room.type);
    const state = useStore.getState();
    state.addChatRoom(room);
    socket.emit('join_room', room.id);
  });

  return socket;
};

export const joinRoom = (chatRoomId) => {
  if (socket) {
    socket.emit('join_room', chatRoomId);
  }
};

export const leaveRoom = (chatRoomId) => {
  if (socket) {
    socket.emit('leave_room', chatRoomId);
  }
};

export const sendRoomMessage = (chatRoomId, text, sharedPatientId = null, imageUri = null) => {
  const { userProfile } = useStore.getState();
  if (socket) {
    socket.emit('send_room_message', {
      chatRoomId,
      senderId: userProfile.id,
      text,
      sharedPatientId,
      imageUri,
    });
  }
};

export const sendMessage = (toId, text) => {
  const { userProfile } = useStore.getState();
  if (socket) {
    socket.emit('message', {
      to: toId,
      from: userProfile.id,
      text,
      senderName: userProfile.name,
    });
  }
};

export const shareEMRRecord = (toId, patient) => {
  const { userProfile } = useStore.getState();
  if (socket) {
    socket.emit('share_emr', {
      to: toId,
      from: userProfile.id,
      patient,
      senderName: userProfile.name,
    });
  }
};
