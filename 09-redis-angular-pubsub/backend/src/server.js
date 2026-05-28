import express from "express";
import http from "http";
import { Server } from "socket.io";
import Redis from "ioredis";
import cors from "cors";

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Redis subscriber
const subscriber = new Redis({
  host: "127.0.0.1",
  port: 6379,
});

subscriber.on("connect", () => {
  console.log("Redis connected");
});

io.on("connection", (socket) => {
  console.log("Angular client connected:", socket.id);
});

// Subscribe Redis channel
subscriber.subscribe("notifications");

subscriber.on("message", (channel, message) => {
  console.log("Redis message:", message);

  // Broadcast to Angular clients
  io.emit("notification", JSON.parse(message));
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});