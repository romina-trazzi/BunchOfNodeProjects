// src/models/UserMovie.js
// Relazione N:M tra User e Movie con attributi extra lato utente.
// - favorite: se l'utente ha marcato il film come "preferito"
// - watchlist: se è in "da vedere"
// - rating: voto 1..10 (opzionale)
// - notes: note personali (testo breve)
//
// NOTA: le colonne "userId" e "movieId" vengono aggiunte dalle associazioni
//       definite in src/models/index.js (belongsToMany con through: UserMovie).

import { DataTypes } from 'sequelize';
import { sequelize } from '../db/sequelize.js';

const UserMovie = sequelize.define('UserMovie', {
  favorite: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  watchlist: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  rating: {
    // Voto opzionale 1..10 (intero); null = non votato
    // TINYINT va benissimo su MySQL; in alternativa puoi usare INTEGER con min/max.
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: true,
    validate: {
      min: { args: [1], msg: 'Il rating minimo è 1' },
      max: { args: [10], msg: 'Il rating massimo è 10' }
    }
  },
  notes: {
    // Annotazioni personali (max ~1000 char per restare leggeri)
    type: DataTypes.STRING(1000),
    allowNull: true
  }
}, {
  tableName: 'user_movies',
  timestamps: true, // createdAt = quando aggiunto in lista; updatedAt = ultimo update (rating/note)
  indexes: [
    // Evita duplicati: un solo record per utente/film
    { unique: true, fields: ['userId', 'movieId'] },

    // Filtri frequenti
    { fields: ['favorite'] },
    { fields: ['watchlist'] },
    { fields: ['rating'] }
  ]
});

/**
 * Helper opzionale per risposte API coerenti.
 * Restituisce i campi "pubblicabili" del pivot, inclusi userId e movieId.
 */
UserMovie.prototype.toPublic = function () {
  const {
    userId, movieId, favorite, watchlist, rating, notes, createdAt, updatedAt
  } = this.get({ plain: true });
  return { userId, movieId, favorite, watchlist, rating, notes, createdAt, updatedAt };
};

export default UserMovie;



/* Commento:

Tabella ponte per la relazione N:M tra User e Movie, con metadati dell’utente sul film (es. in watchlist, preferito, rating, note).
Avremo un record al massimo per coppia (userId, movieId).

Perché così

Indice unico su (userId, movieId): impedisce di creare la stessa relazione due volte.
timestamps: true: utile sapere quando un film è stato aggiunto in watchlist o quando è stato aggiornato il rating.
toPublic(): la risposta al client è uniforme e non contiene metadati interni indesiderati.
Campi booleani separati: semplice da interrogare (WHERE watchlist = 1, WHERE favorite = 1). */