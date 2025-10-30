require('dotenv').config(); // carica le variabili d'ambiente da .env

const common = {
  dialect: 'postgres',
  logging: false,
  define: {
    freezeTableName: true, 
    timestamps: true       
  }
};

module.exports = {
  development: {
    ...common,
    url: process.env.DATABASE_URL
  },
  test: {
    ...common,
    url: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL
  },
  production: {
    ...common,
    url: process.env.DATABASE_URL,
    dialectOptions: {
      // usa SSL se PostgreSQL è gestito da un provider esterno con SSL
      // ssl: { require: true, rejectUnauthorized: false }
    }
  }
};