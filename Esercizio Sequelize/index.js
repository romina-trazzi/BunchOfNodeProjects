const express = require('express');
const bodyparser = require('body-parser');
const { sequelize } = require('./dbconnection');
const router = require('./routes/routes');

// Crea un'applicazione Express
const app = express();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});


// Connessione al database
(async () => {
  
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    
    console.log('DB ok');

    app.use('/', router);

    app.listen(3000, () => {
      console.log('Server running on port 3000');
    });
  
  
  } catch (err) {
    console.error('DB error:', err);
  }
})();





 

