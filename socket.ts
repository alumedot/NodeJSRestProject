import { Server } from 'socket.io';
import http from 'http';

let io: Server;

export const init = (httpServer: http.Server) => {
  io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  return io;
}

export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io is not initialised');
  }

  return io;
}
