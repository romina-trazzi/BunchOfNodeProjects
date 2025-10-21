// src/models/Movie.js
// Modello "Movie": cache locale di un film preso da TMDB.
// - tmdbId: ID numerico di TMDB (UNICO)
// - title/overview/releaseDate: info principali
// - posterPath/backdropPath: path degli asset su TMDB (non URL completo)
// - runtime/originalLanguage/popularity/voteAverage/voteCount: metadati utili
// - lastSyncedAt: quando abbiamo aggiornato questo record dal TMDB (per refresh periodici)

import { DataTypes } from 'sequelize';
import { sequelize } from '../db/sequelize.js';

const Movie = sequelize.define('Movie', {
  tmdbId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    unique: true,
    validate: { min: 1 }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: { len: { args: [1, 200], msg: 'Titolo obbligatorio (max 200)' } }
  },
  originalTitle: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  overview: {
    type: DataTypes.TEXT, // descrizione/overview testuale
    allowNull: true
  },
  releaseDate: {
    // Solo data (YYYY-MM-DD). Se non disponibile su TMDB, può restare null.
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  originalLanguage: {
    // Codice lingua ISO 639-1 (es. 'en', 'it')
    type: DataTypes.STRING(5),
    allowNull: true
  },
  runtime: {
    // Durata in minuti
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    validate: { min: 0 }
  },
  posterPath: {
    // TMDB fornisce solo il "path" (es. /kqjL17yufvn9OVLyXYpvtyrFfak.jpg)
    type: DataTypes.STRING(255),
    allowNull: true
  },
  backdropPath: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  popularity: {
    // Valore floating TMDB (ordinamenti, trending)
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: { min: 0 }
  },
  voteAverage: {
    // Media voti TMDB (0..10, spesso con 1 decimale)
    type: DataTypes.DECIMAL(3, 1), // es. 7.8
    allowNull: true,
    validate: {
      min(value) { if (value !== null && Number(value) < 0) throw new Error('voteAverage >= 0'); },
      max(value) { if (value !== null && Number(value) > 10) throw new Error('voteAverage <= 10'); }
    }
  },
  voteCount: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    validate: { min: 0 }
  },
  lastSyncedAt: {
    // Quando abbiamo aggiornato i dati dal TMDB l’ultima volta
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'movies',
  timestamps: true,
  indexes: [
    // Ricerca veloce per titolo (LIKE), ordinamenti per popolarità e data
    { fields: ['title'] },
    { fields: ['popularity'] },
    { fields: ['releaseDate'] },
    { unique: true, fields: ['tmdbId'] }
  ]
});

/**
 * Helper opzionale: restituisce una versione "pubblica" del movie,
 * utile per risposte API coerenti (non contiene campi interni superflui).
 */
Movie.prototype.toPublic = function () {
  const {
    id, tmdbId, title, originalTitle, overview, releaseDate,
    originalLanguage, runtime, posterPath, backdropPath,
    popularity, voteAverage, voteCount, createdAt, updatedAt
  } = this.get({ plain: true });
  return {
    id, tmdbId, title, originalTitle, overview, releaseDate,
    originalLanguage, runtime, posterPath, backdropPath,
    popularity, voteAverage, voteCount, createdAt, updatedAt
  };
};

export default Movie;


/* Perché solo il “path” e non l’URL completo per i poster?
TMDB cambia spesso base URL e size (es. https://image.tmdb.org/t/p/w500).
Salvare il path ti consente di comporre l’URL lato frontend/backoffice con la size che preferisci.

lastSyncedAt: ti permette di implementare una logica tipo “se è più vecchio di 7 giorni, rifaccio fetch da TMDB e aggiorno”.

Indice su title: utile per ricerche; in MySQL è un indice normale (se vuoi full-text, valuterai più avanti). */