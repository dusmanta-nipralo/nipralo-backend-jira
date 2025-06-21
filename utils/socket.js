let io;
const userSockets = new Map();

function initSocket(server) {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: '*', // Or your frontend domain
      methods: ['GET', 'POST'],
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      userSockets.set(userId, socket.id);
    }

    socket.on('disconnect', () => {
      userSockets.forEach((sid, uid) => {
        if (sid === socket.id) userSockets.delete(uid);
      });
    });
  });
}

function notifyUser(userId, event, data) {
  const socketId = userSockets.get(userId);
  if (socketId && io) {
    io.to(socketId).emit(event, data);
  }
}

module.exports = { initSocket, notifyUser };
