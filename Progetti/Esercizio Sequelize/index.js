const express = require('express');
const bodyparser = require('body-parser');
const sequelize = require('./models');
const Product = require('./models/product');

// Crea un'applicazione Express
const app = express();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

// Rotta di base
app.get('/', (req, res, next) => {
  res.render('index');
});

// CRUD routes
app.use('/products', require('./routes/routes'));

// Error handling
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});

// Sincronizza database
sequelize
  .sync()
  .then(result => {
    console.log("Database connected");
    app.listen(3000);
  })
  .catch(err => console.log(err));










 

