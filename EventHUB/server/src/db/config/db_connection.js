// server/src/db/config/db_connection.js

/**
 * Database connection manager
 * ----------------------------
 * Creates and manages a single Sequelize instance for the app.
 * Works both locally (development) and on hosted platforms (Render, Heroku, etc.).
 */

const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

const env = process.env.NODE_ENV || 'development';
const allConfigs = require('./config.js');
const cfg = allConfigs[env];

// Decide if we should use DATABASE_URL (production) or manual params (development)
let sequelize;

// Usa DATABASE_URL solo se siamo in produzione
if (process.env.DATABASE_URL && env !== 'development') {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
    logging: env === 'development' ? console.log : false,
  });
} else {
  // Locale: usa le variabili dal .env (tramite config.js)
  sequelize = new Sequelize(cfg.database, cfg.username, cfg.password, {
    host: cfg.host,
    port: cfg.port || 5432,
    dialect: 'postgres',
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    logging: env === 'development' ? console.log : false,
    dialectOptions: cfg.ssl ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  });
}

/**
 * Attempt to connect to DB with retries and exponential backoff.
 */
async function connectWithRetry({ attempts = 5, delayMs = 1500, factor = 1.6 } = {}) {
  let delay = delayMs;
  for (let i = 1; i <= attempts; i++) {
    try {
      await sequelize.authenticate();
      console.log(`[DB] ✅ Connected to ${cfg.database} (attempt ${i})`);
      return;
    } catch (err) {
      console.warn(`[DB] ❌ Connection failed (attempt ${i}): ${err.message}`);
      if (i === attempts) throw err;
      console.log(`[DB] Retrying in ${delay / 1000}s...`);
      await new Promise((res) => setTimeout(res, delay));
      delay = Math.ceil(delay * factor);
    }
  }
}

/**
 * Graceful shutdown
 */
async function closeDb() {
  try {
    await sequelize.close();
    console.log('[DB] Connection closed.');
  } catch (err) {
    console.error('[DB] Error closing connection:', err.message);
  }
}

process.on('SIGINT', async () => {
  console.log('[DB] SIGINT received → closing connection...');
  await closeDb();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('[DB] SIGTERM received → closing connection...');
  await closeDb();
  process.exit(0);
});

module.exports = { sequelize, connectWithRetry, closeDb };











