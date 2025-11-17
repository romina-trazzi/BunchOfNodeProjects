// server/src/server.js

/**
 * Express application entrypoint
 * ------------------------------
 * Starts the HTTP server after ensuring the database is connected.
 * Serves the static frontend, exposes health endpoints,
 * and configures essential security middleware.
 */

require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

// Import the Sequelize connection and retry helper
const { sequelize, connectWithRetry } = require('./config/db_connection');

// Import initialized models (this automatically loads User, Event, etc.)
const db = require('./models');

// Import routes
const authRoutes = require("./routes/authRoutes"); 
const eventRoutes = require("./routes/eventRoutes");
const adminRoutes = require("./routes/adminRoutes");


const app = express();
const PORT = Number(process.env.PORT) || 4000;



/* ---------------------------
 * Security & body parsing
 * --------------------------- */


  // Configure Helmet with custom CSP (Content Security Policy)
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "default-src": ["'self'"],
          "script-src": [
            "'self'",
            "https://cdn.jsdelivr.net",
            "https://cdnjs.cloudflare.com"
          ],
          "style-src": [
            "'self'",
            "https://cdn.jsdelivr.net",
            "https://cdn.jsdelivr.net",
            "https://fonts.googleapis.com"
          ],
          "font-src": [
            "'self'",
            "https://fonts.gstatic.com",
            "https://cdn.jsdelivr.net"
          ],
          "img-src": ["'self'", "data:", "https://cdn.jsdelivr.net"],
        },
      },
      crossOriginEmbedderPolicy: false, // evita problemi con risorse esterne (es. Bootstrap)
    })
  );




app.use(express.json());

/* ---------------------------
 * Static frontend
 * --------------------------- */

// Serve static assets (CSS, JS, images, etc.)
// Build absolute path to the client folder (works on all OS)
const publicDir = path.join(__dirname, '..', '..', 'client');

// Serve all static files (CSS, JS, images)
app.use(express.static(publicDir));

// Serve index.html for the root route
app.get('/', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});


/* ---------------------------
 * Health check endpoint
 * --------------------------- */
app.get('/health', async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({ ok: true, db: 'up' });
  } catch (err) {
    res.status(503).json({ ok: false, db: 'down', error: err.message });
  }
});


/* ---------------------------
 * API routes
 * --------------------------- */
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/auth', authRoutes);
app.use("/api/admin", adminRoutes);

/* ---------------------------
 * Server start sequence
 * ---------------------------
 * 1. Try to connect to the DB (with retry logic).
 * 2. Sync all models (if desired).
 * 3. Start listening for HTTP requests.
 */
(async () => {
  try {
    // Step 1: Ensure DB connection
    await connectWithRetry();

    // Step 2: Sync models (optional: remove in production)
    await db.sequelize.sync();
    console.log('✅ Models synchronized with database');

    // Step 3: Start the Express server
    app.listen(PORT, () => {
      console.log(`🚀 EventHub API running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1); // Exit the process if DB connection fails
  }
})();

// Export app for testing (optional)
module.exports = app;



