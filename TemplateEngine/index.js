const express = require('express');
const PORT = 3000;

// Crea un'applicazione Express
const app = express();


// Rotta di base
app.get('/', (req, res) => {
    res.redirect('/users');
    res.render('index');
});

app.get('/users/:id', (req, res) => {
    const userId = req.params.id;
    res.send(`<p>User ID: ${id}</p>`);
});

app.use(express.urlencoded({ extended: false }));

// Avvia il server
app.listen(PORT, () => {
    console.log(`Server attivo su http://localhost:${PORT}`);
});
