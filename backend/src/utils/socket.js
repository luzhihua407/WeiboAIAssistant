// socket.js
import { Server } from 'socket.io';
import WeiboTool from '#root/webtool/weibo.js';

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
    console.log('客户端已连接');
    WeiboTool.startBrowser().then(() => {
      console.log('浏览器已启动');
      WeiboTool.signin().then(() => {
        console.log('登录成功');
        socket.emit('loginSuccess', 'Login successful!');
      }).catch((error) => {
        console.error('登录失败:', error.message);
        socket.emit('loginError', 'Login failed!');
      }).finally(() => {
        console.log('登录流程结束');
        WeiboTool.stopBrowser().then(() => {
          console.log('浏览器已关闭');
        });
      });
    });
 
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