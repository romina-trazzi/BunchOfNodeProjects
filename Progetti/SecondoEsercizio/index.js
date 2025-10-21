// Librerie js 
const dayjs = require('dayjs');
const prompt = require('prompt-sync')({sigint: true});

dayjs().format()


// Se sono stati passati argomenti da linea di comando argv deve essere > 2
// 0 = node, 1 = nome del file (index.js), 2 = argomenti
if (process.argv.length > 2) {
    
    console.log('Argomenti passati da linea di comando:');
  
    for (let i = 2; i < process.argv.length; i++) {
        console.log(`- ${process.argv[i]}`);
    }

// Altrimenti chiedere all'utente
} else {
    
    let anno = prompt('Inserisci anno:');
    let mese = prompt('Inserisci mese:');
    let giorno = prompt('Inserisci giorno:');
    let giorni = prompt('Inserisci un numero di giorni da aggiungere o sottrarre:');
    
    let dataUtente = dayjs(`${anno}-${mese}-${giorno}`, 'YYYY-MM-DD');
    
    if(dataUtente.isValid()){
        console.log(`La data inserita è ${dataUtente.format('YYYY-MM-DD')}`);
        let domanda = prompt('Vuoi aggiungere o sottrarre giorni? (a/s): ');
    
        // Aggiungere giorni
        if (domanda.toLowerCase() === 'a'){
            let nuovaData = dataUtente.add(giorni, 'day').format('YYYY-MM-DD');
            console.log(`La nuova data è ${nuovaData}`);
    
        // Sottrarre giorni
        } else if (domanda.toLowerCase() === 's'){
            let nuovaData = dataUtente.subtract(giorni, 'day').format('YYYY-MM-DD');
            console.log(`La nuova data è ${nuovaData}`);
    
        // Qualunque altro input
        } else {
            console.log('Operazione non valida');
        }
    
    } else {
        console.log('Data non valida');
    }

}





