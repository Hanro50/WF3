import { createRequestHandler } from "@remix-run/express";
import express from "express";
import parser from "body-parser";
import { Server } from "socket.io";
import http from "http";
import * as build from "../build/index.js";
const app = express();
const server = http.createServer(app);
export const io = new Server(server);

export const router = express.Router();
app.use(parser.json());
io.on("connection", (socket) => {
  console.log("a user connected");
});
app.use("/api", router);

app.use(express.static("public"));

// and your app is "just a request handler"
app.all("*", createRequestHandler({ build }));
server.listen(3000, () => {
  console.log("listening on *:3000");
});
