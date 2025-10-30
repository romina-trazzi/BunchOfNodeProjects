require('dotenv').config(); // Load environment variables from .env file

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

  }
};