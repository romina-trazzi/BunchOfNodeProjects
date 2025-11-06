// server/src/db/config/config.js

/**
 * Database configuration file
 * ---------------------------
 * Defines environment-specific settings for Sequelize.
 * Supports both local development and production/cloud environments.
 */


// Load environment variables from .env file (already loaded in app)
require('dotenv').config(); // This is fine, it loads the environment variables

const common = {
  dialect: 'postgres',
  define: {
    freezeTableName: true, // Keeps table names as defined (no automatic plural)
    timestamps: true,      // Automatically adds createdAt/updatedAt fields
  },
  logging: false,          // Disabled here (controlled in db_connection.js)
};

// Small helper: convert "false"/"true" strings to real booleans
const parseBool = (value) => {
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return !!value;
};


module.exports = {
  development: {
    ...common,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'trazzi',
    database: process.env.DB_NAME || 'eventhub',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    ssl: parseBool(process.env.DB_SSL) || false, 
  },

  production: {
    ...common,
    use_env_variable: 'DATABASE_URL', // Uses DATABASE_URL when deployed
    ssl: true, // Cloud providers (Render/Heroku/Railway) usually need SSL
  },
};













