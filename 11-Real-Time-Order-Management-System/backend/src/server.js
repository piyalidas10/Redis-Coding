import express from "express";
import cors from "cors";
import http from "http";

import orderRoutes from "./routes/order.routes.js";

import { initSocket } from "./socket/socket.js";

import {
  startSubscriber
} from "./subscribers/order.subscriber.js";

const app = express();
app.disable('etag');

/*
  Middleware
*/

app.use(cors());
app.use(express.json());

/*
  Routes
*/

app.use("/orders", orderRoutes);

/*
  Health Check
*/

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Order API Running"
  });
});

/*
  HTTP Server
*/

const server = http.createServer(app);

/*
  Socket.IO
*/

initSocket(server);

/*
  Redis Subscriber
*/

await startSubscriber();

/*
  Start Server
*/

const PORT = 3000;

server.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT}`
  );
});