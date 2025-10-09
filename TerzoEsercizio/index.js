// Librerie 
const axios = require('axios');
const prompt = require('prompt-sync')({sigint: true});
const fs = require('fs/promises');

const FILE_NAME = 'pokemon.json';

// Funzione per ottenere i dati di un Pokemon
async function getPokemon(address) { 

    try {

        // Richiesta tramite Axios di un Pokemon
        const response = await axios.get(address);
        
        if (response.status === 200) {

            // Estrazione dei dati
            const data = response.data;

            // Stampa a schermo dei dati
            console.log("Nome: " + data.name);
            console.log("ID: " + data.id);
            console.log("Altezza: " + data.height);
            console.log("Peso: " + data.weight);
            console.log("Tipo: " + data.types.map(typeInfo => typeInfo.type.name).join(', '));

            return {

                // Restituisci un oggetto serializzabile come JSON
                name: data.name,
                id: data.id,
                height: data.height,
                weight: data.weight,
                types: data.types.map(t => t.type.name)
            };
        } else {

            // Se lo status non è 200, ritorna null per coerenza
            return null;
        }
        

    } catch (err) {

        if (err.response && err.response.status === 404) {
            console.error("Pokemon non trovato.");
        
        } else {

            console.error("Errore nella richiesta:", err.message);
        }    
       
    }
}    

// Crea o Leggi un file JSON esistente
async function readJsonArray(fileName) {
  try {
    const raw = await fs.readFile(fileName, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  
} catch (err) {

    // Se non esiste o JSON invalido => parti da array vuoto
    if (err.code !== 'ENOENT') {
      console.warn(`Avviso: file esistente ma non leggibile/valido, riparto da array vuoto (${err.message})`);
    }
    return [];
  }
}

// Scrivi un array in un file JSON
async function writeJsonArray(fileName, array) {
  await fs.writeFile(fileName, JSON.stringify(array, null, 2), 'utf8');
}

// Salva il risultato in un file JSON
async function appendPokemon(fileName, pokemonObj) {
  const existingData = await readJsonArray(fileName);

  const exists = existingData.some(p => p.id === pokemonObj.id);
  if (exists) {
    console.log(`Pokémon "${pokemonObj.name}" è già presente in ${fileName}, non verrà aggiunto di nuovo.`);
    return false;
  }

  existingData.push(pokemonObj);
  await writeJsonArray(fileName, existingData);
  console.log(`Pokémon "${pokemonObj.name}" aggiunto in ${fileName}. Totale: ${existingData.length}`);
  return true;
}

// Funzione auto-eseguita (IIFE) che funge da "main" del programma
(async () => {
  console.log('Inserisci nomi di Pokémon (invio vuoto o "q" per terminare)');
  
  while (true) {
    let pokemon = prompt('Nome Pokémon: ');
    if (!pokemon || pokemon.trim().toLowerCase() === 'q') break;

    pokemon = pokemon.toLowerCase().trim();
    const address = 'https://pokeapi.co/api/v2/pokemon/' + pokemon;

    const result = await getPokemon(address);
    if (result) {
      await appendPokemon(FILE_NAME, result);
    } else {
      console.log("Nessun dato valido da salvare per questo input.");
    }
    console.log('—');
  }

  console.log(`Fatto. Puoi aprire "${FILE_NAME}" per vedere la collezione aggiornata.`);
})();













    

    



