const logger = require('../config/logger');
const { Server } = require('socket.io');

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  const connectedClients = new Map();

  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);
    connectedClients.set(socket.id, socket);

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
      connectedClients.delete(socket.id);
    });
  });

  return io;
}

module.exports = initSocket;
