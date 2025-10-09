// Importo delle librerie necessarie
const express = require("express");
const path = require("path");

// Configurazione dell'app Express
const app = express();
const PORT = 3000;


// Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Chi siamo
app.get("/chi-siamo", (req, res) => {
  res.sendFile(path.join(__dirname, "who.html"));
});

// Redirect da /who a /chi-siamo
app.get("/who", (req, res) => {
  res.redirect(301, "chi-siamo"); 
});

// Contatti
app.get("/contatti", (req, res) => {
  res.sendFile(path.join(__dirname, "contacts.html"));
});

// Redirect da /contacts a /contatti
app.get("/contacts", (req, res) => {
  res.redirect(301, "contatti"); 
});

app.listen(PORT, () => {
  console.log(`Server avviato su http://localhost:${PORT}`);
});

// Gestione degli errori 404
app.use((req, res, next) => {
  res.status(404).send("Pagina non trovata");
});




