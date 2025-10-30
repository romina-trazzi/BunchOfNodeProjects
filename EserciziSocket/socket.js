import { io } from "socket.io-client";

// Connettiti al server
const socket = io("ws://localhost:3000");

// Quando ti connetti, logga ed invia un messaggio di prova
socket.on("connect", () => {
  console.log("🔗 Connesso al server con ID:", socket.id);
  socket.emit("messaggio", "Ciao dal client!");
});

// Ascolta i messaggi broadcast del server
socket.on("messaggio", (msg) => {
  console.log("📡 Messaggio dal server:", msg);
});

// Logga la disconnessione
socket.on("disconnect", (reason) => {
  console.log("⛔ Disconnesso dal server:", reason);
});

// Chiudi dopo 2 secondi per vedere l'evento 'disconnect'
setTimeout(() => socket.disconnect(), 2000);