const bcrypt = require('bcrypt');
const prompt = require('prompt-sync')();

const saltRounds = 10;

async function main() {
    const password = prompt('Inserisci la password da hashare: ');

    // Hash
    const hash = await bcrypt.hash(password, saltRounds);
    console.log("Password iniziale:", password);
    console.log("Hash:", hash);

    // Comparazione
    const password2 = prompt('Reinserisci la password: ');
    const result = await bcrypt.compare(password2, hash);

    if (result) {
        console.log("Le password sono uguali");
    } else {
        console.log("Le password non sono uguali");
    }
}

main();




















