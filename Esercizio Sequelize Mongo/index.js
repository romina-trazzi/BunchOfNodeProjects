// Importa i moduli necessari
const express = require("express");
const mongoose = require("mongoose");
const { Schema } = mongoose;

// Avvia app express
const app = express();
app.use(express.json());

// Connetti al database 
mongoose.connect('mongodb://localhost:27017/Libri');
const MyModel = mongoose.model('Test', new Schema({ name: String }));
// Works
await MyModel.findOne();


// Definisci le rotte

// Se l'URL inizia con /books, usa le rotte definite in routes/book-routes.js
app.use("/books", require("./routes/book-routes"));


// Avvia il server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server attivo su http://localhost:${PORT}`)
);
