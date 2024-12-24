// socket.js
import { Server } from 'socket.io';

let io;

export function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*", // 或者指定允许的域名 "http://localhost:1420"
      methods: ["GET", "POST"],
      credentials: false
    }
  });

  io.on('connection', (socket) => {
    console.log('A client connected');

    // Send a message to the client immediately after they connect
    socket.emit('message', 'Hello from server!');

    // Listen for a message from the client
    socket.on('ws/notifications', (data) => {
      console.log('Received message from client:', data);
    });

    // Handle client disconnection
    socket.on('disconnect', () => {
      console.log('A client disconnected');
    });
  });
}

export function emitMessage(event, data) {
  if (io) {
    io.emit(event, data);
  } else {
    console.error('Socket.IO is not initialized.');
  }
}