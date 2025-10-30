
'use strict';

// Initializes Sequelize models by reading all model files in the directory

/* fs: Il modulo File System di Node.js viene utilizzato per leggere i file all'interno della cartella models.
path: Usato per gestire i percorsi dei file in modo portabile.
Sequelize: Importa il pacchetto Sequelize per l'inizializzazione della connessione e la gestione dei modelli.
process: Usato per ottenere variabili d'ambiente, come la configurazione di NODE_ENV. */
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');

/* basename: Ottiene il nome del file corrente (index.js), per evitare di caricare lo stesso file.
env: Legge la variabile di ambiente NODE_ENV (di solito impostata su "development", "test", o "production").
config: Carica la configurazione del database dal file config.js, utilizzando l'ambiente corrente per scegliere la configurazione giusta. */
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];

// Initializes an empty object to hold all models.
const db = {};


/* Initializes a new Sequelize instance based on the configuration.
If a specific environment variable is set for the database connection (e.g. Heroku), it uses that.
Otherwise, it uses the standard configuration parameters (database name, username, password, etc.) from config.js. */
let sequelize;

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

/* Reads all files in the current directory (models folder), filters out non-JavaScript files and the current file (index.js),
then imports each model and adds it to the db object. 

fs.readdirSync(__dirname): Legge tutti i file nella cartella models (quella in cui si trova index.js).

.filter(file => {...}): Filtra i file per escludere quelli che:
  - Hanno un punto all'inizio (come il file .git o .DS_Store).
  - Sono uguali al nome del file index.js (per evitare di caricare se stesso).
  - Non hanno l'estensione .js (per escludere file non JavaScript).
  - Non sono test (con estensione .test.js).

  .forEach(file => {...}): Per ogni file valido, carica il modello (file .js) usando require() e lo aggiunge all'oggetto db.
  
*/

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
