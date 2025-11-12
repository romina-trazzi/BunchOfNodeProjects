// server/src/db/models/index.js

/**
 * Sequelize Model Loader
 * ----------------------
 * Dynamically imports all model files in this directory
 * and initializes them using the single Sequelize instance
 * from db_connection.js.
  
  fs: Il modulo File System di Node.js viene utilizzato per leggere i file all'interno della cartella models.
  path: Usato per gestire i percorsi dei file in modo portabile.
  Sequelize: Importa il pacchetto Sequelize per l'inizializzazione della connessione e la gestione dei modelli.
  process: Usato per ottenere variabili d'ambiente, come la configurazione di NODE_ENV. 
*/
 

 
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const { sequelize } = require('../config/db_connection');

/* 
basename: Ottiene il nome del file corrente (index.js), per evitare di caricare lo stesso file.
env: Legge la variabile di ambiente NODE_ENV (di solito impostata su "development", "test", o "production").
config: Carica la configurazione del database dal file config.js, utilizzando l'ambiente corrente per scegliere la configurazione giusta. 
*/
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];

// Initializes an empty object to hold all models.
const db = {};

/* 
Reads all files in the current directory (models folder), filters out non-JavaScript files and the current file (index.js),
then imports each model and adds it to the db object. 

fs.readdirSync(__dirname): Legge tutti i file nella cartella models (quella in cui si trova index.js).

.filter(file => {...}): Filtra i file per escludere quelli che:
  - Hanno un punto all'inizio 
  - Sono uguali al nome del file index.js (per evitare di caricare se stesso).
  - Non hanno l'estensione .js (per escludere file non JavaScript).
  - Non sono test (con estensione .test.js).

  .forEach(file => {...}): Per ogni file valido, carica il modello (file .js) usando require() e lo aggiunge all'oggetto db.
*/


fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 && // skip hidden files
      file !== basename &&       // skip index.js
      file.slice(-3) === '.js' && // only .js files
      !file.endsWith('.test.js')  // skip test files
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

/* 
Object.keys(db): Ottiene tutti i nomi dei modelli caricati.
if (db[modelName].associate): Verifica se il modello ha un metodo associate per definire le relazioni tra i modelli (ad esempio, se User ha molti Events).
db[modelName].associate(db): Esegue la funzione associate per stabilire le relazioni tra i modelli, passando l'oggetto db che contiene tutti i modelli.
*/

// If models define associations, run them here
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});


/* 
db.sequelize: Esporta l'istanza di Sequelize per poterla usare in altre parti del progetto.
db.Sequelize: Esporta il costruttore di Sequelize, che può essere utilizzato per definire i tipi di dati e altri oggetti relativi a Sequelize.
module.exports = db: Esporta l'oggetto db, che contiene:
  - I modelli (come User, Event, Registration, Message).
  - L'istanza di Sequelize.
  - Il costruttore di Sequelize.
*/

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;









