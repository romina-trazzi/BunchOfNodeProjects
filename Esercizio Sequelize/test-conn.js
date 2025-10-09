const sequelize = require('./db');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connessione OK con Sequelize + mysql2');
    process.exit(0);
  } catch (err) {
    console.error('Errore di connessione:', err);
    process.exit(1);
  }
})();