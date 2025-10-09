const express = require('express');

const PORT = 3000;


// Crea un'applicazione Express
const app = express();


// Creazione di un middleware per misurare il tempo di risposta
app.use((req, res, next) => {
    
    const method = req.method;
    const url = req.url;
    const timestamp = new Date();
    
    console.log(`${timestamp} - ${method} - ${url}`);
    next(); 
});


// Rotta di base
app.get('/', (req, res) => {
    res.send('Hello World!');
});


// Richiesta POST al server
app.post('/', (req, res) => {
    console.log(req.body); // dati inviati dal client
    res.send('Data received!');
});


// Richiesta PUT al server
app.put('/', (req, res) => {
    console.log(req.body); // dati modificati
    res.send('Data updated!');
});

app.listen(PORT);

console.log(`Server is running at http://localhost:${PORT}`);



