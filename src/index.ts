import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { IEmojiData, IJoinedUsersData } from "./helper/interface";

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

// for managing users data
const joinedUsersData: IJoinedUsersData = {};

// handling the socket connection
io.on("connection", (socket: Socket) => {
  console.log("socket connected successfully");

  // to add the user data
  socket.on("addUserData", ({ peerID, roomID, isMeetingOrganiser, name }) => {
    if (!joinedUsersData[roomID]) {
      joinedUsersData[roomID] = {};
    }
    if (!joinedUsersData[roomID][peerID]) {
      joinedUsersData[roomID][peerID] = { isMeetingOrganiser, name, peerID };
    }
    // sending users data to everyone in room including new user
    io.to(roomID).emit("allUsersData", joinedUsersData[roomID]);
  });

  // to handle join room
  socket.on("joinRoom", ({ currentRoomID, peerID }) => {
    socket.join(currentRoomID);
    socket.broadcast.to(currentRoomID).emit("joinedRoom", { peerID });
  });

  // receive the emojies data
  socket.on(
    "newEmojies",
    ({
      updatedEmojiesData,
      currentRoomID,
    }: {
      updatedEmojiesData: IEmojiData[];
      currentRoomID: string;
    }) => {
      socket.broadcast
        .to(currentRoomID)
        .emit("updatedEmojies", updatedEmojiesData);
    }
  );

  // to handle mic update
  socket.on(
    "changeMicOption",
    ({
      peerID,
      isMuted,
      currentRoomID,
    }: {
      peerID: string;
      isMuted: boolean;
      currentRoomID: string;
    }) => {
      socket.broadcast
        .to(currentRoomID)
        .emit("updateMicOption", { peerID, isMuted });
    }
  );

  // when user disconnects
  socket.on("disconnect", () => {
    console.log("Socket connection disconnected");
  });
});

// listening the server
httpServer.listen(process.env.PORT || 5000);
