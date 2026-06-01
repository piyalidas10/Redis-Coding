import { Server } from "socket.io";

let io;

export function initSocket(server) {

  io = new Server(server, {
    cors: {
      origin: "http://localhost:4200",
      methods: ["GET", "POST", "PUT"]
    }
  });

  io.on("connection", socket => {

    console.log(
      `🔌 Client Connected: ${socket.id}`
    );

    socket.on("disconnect", () => {

      console.log(
        `❌ Client Disconnected: ${socket.id}`
      );
    });
  });

  return io;
}

export function getIO() {

  if (!io) {
    throw new Error(
      "Socket.IO not initialized"
    );
  }

  return io;
}