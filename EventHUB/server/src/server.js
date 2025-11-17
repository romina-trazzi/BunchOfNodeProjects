const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
require('dotenv').config();
const path = require('path');
const helmet = require('helmet');


// Import the Sequelize connection and retry helper
const { sequelize, connectWithRetry } = require('./config/db_connection');

// Import routes
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// Crea il server HTTP per utilizzare Socket.io
const server = http.createServer(app);

// Inizializza Socket.io
const io = socketIo(server);

// Impostiamo io in app per renderlo accessibile nei controller
app.set("io", io);

// Configurazione di Socket.io
io.on('connection', (socket) => {
  console.log('Un client si è connesso:', socket.id);

  // Il client entra nella "stanza" dell'evento
  socket.on('join-event', (eventId) => {
    socket.join(eventId);
    console.log(`Socket ${socket.id} è entrato nella stanza evento ${eventId}`);
  });

  // Quando arriva un messaggio -> lo inviamo SOLO alla stanza dell’evento
  socket.on('new-message', (data) => {
    console.log(`Messaggio in evento ${data.eventId}:`, data.message);
    socket.to(data.eventId).emit('new-message', data);
  });

  // Notifica live: iscrizione
  socket.on('new-registration', (data) => {
    socket.to(data.eventId).emit('new-registration', data);
  });

  // Notifica live: disiscrizione
  socket.on('user-unsubscribed', (data) => {
    socket.to(data.eventId).emit('user-unsubscribed', data);
  });

  // Notifica agli admin: evento segnalato
  socket.on('event-reported', (data) => {
    io.emit('event-reported', data);
  });

  socket.on('disconnect', () => {
    console.log('Un client si è disconnesso:', socket.id);
  });
});

// Configurazione sicurezza e body parsing
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "default-src": ["'self'"],

        "script-src": [
          "'self'"
        ],

        "script-src-elem": [
          "'self'",
          "https://cdn.jsdelivr.net",
          "https://cdnjs.cloudflare.com"
        ],

        "style-src": [
          "'self'",
          "https://cdn.jsdelivr.net",
          "https://fonts.googleapis.com",
          "'unsafe-inline'"
        ],

        "font-src": [
          "'self'",
          "https://fonts.gstatic.com",
          "https://cdn.jsdelivr.net"
        ],

        "img-src": [
          "'self'",
          "data:",
          "https://cdn.jsdelivr.net"
        ],

        "connect-src": [
          "'self'",
          "ws://localhost:4000",
          "http://localhost:4000"
        ]
      }
    },
    crossOriginEmbedderPolicy: false
  })
);

// Altre configurazioni di Express
app.use(express.json());

// Serve static assets (CSS, JS, images, etc.)
const publicDir = path.join(__dirname, '..', '..', 'client');
app.use(express.static(publicDir));

// Serve index.html per la root route
app.get('/', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Health check endpoint
app.get('/health', async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ ok: true, db: 'up' });
  } catch (err) {
    res.status(503).json({ ok: false, db: 'down', error: err.message });
  }
});

// API routes
app.use('/api/events', eventRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/admin", adminRoutes);

// Avvio del server
(async () => {
  try {
    await connectWithRetry();
    await sequelize.sync();
    console.log('✅ Models synchronized with database');
    server.listen(PORT, () => {
      console.log(`🚀 EventHub API running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
})();

module.exports = app;
