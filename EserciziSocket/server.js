// npm i express socket.io
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// serve file statici dalla STESSA cartella di server.js
app.use(express.static(__dirname));

const httpServer = createServer(app);
const io = new Server(httpServer); // stesso origin

io.on("connection", (socket) => {
  console.log("✅ Connesso:", socket.id);

  socket.on("messaggio", (msg) => {
    console.log("📩", msg);
    io.emit("messaggio", msg); // broadcast
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Disconnesso:", socket.id, "-", reason);
  });
});

// rotta esplicita per index.html (facoltativa, ma utile)
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

httpServer.listen(3000, () => {
  console.log("➡️  Apri: http://localhost:3000");
});