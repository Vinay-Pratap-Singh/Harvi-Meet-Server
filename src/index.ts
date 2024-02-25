import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server, Socket } from "socket.io";

// setting up dot env
dotenv.config();

const app = express();
const isDevEnv = app.settings.env === "development";
const URL = isDevEnv ? "http://localhost:3000" : process.env.FRONTEND_URL;
app.use(
  cors({
    origin: URL,
  })
);

// creating the socket server
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: URL,
  },
});

// handling the socket connection
io.on("connection", (socket: Socket) => {
  console.log("socket connected successfully");

  socket.on("sendNewStream", ({ newStream }) => {
    console.log("data done");
    socket.broadcast.emit("newStream", newStream);
  });

  // when user disconnects
  socket.on("disconnect", () => {
    console.log("Socket connection disconnected");
  });
});

// listening the server
httpServer.listen(process.env.PORT || 5000);
