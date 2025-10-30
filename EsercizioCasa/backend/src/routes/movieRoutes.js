// src/routes/movieRoutes.js
// Route per i MOVIES (cache locale + integrazione TMDB).
// Ordine importante: le route "statiche" vanno PRIMA di '/:id' per evitare collisioni.

import { Router } from 'express';

// Controller "cache locale"
import { listMovies, getMovieById, upsertMovieByTmdb } from '../controllers/movieController.js';

// Controller extra (utility comode per la UI)
import { getMovieByTmdbId, getMyMovieMeta } from '../controllers/movieExtrasController.js';

// (Opzionale) Ricerca remota su TMDB senza salvare in cache
// Se non vuoi esporla, commenta le 3 righe qui sotto e la route più giù.
import { searchTmdb } from '../controllers/movieSearchController.js';

import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/requireRole.js';

// Schemi Joi
import {
  searchMoviesQuerySchema,
  movieIdParamSchema,
  tmdbIdParamSchema,
  upsertMovieByTmdbBodySchema
} from '../validation/movieSchemas.js';

const router = Router();

/* =======================================================================
   🔎 Ricerca remota su TMDB (opzionale, non tocca la cache locale)
   GET /api/movies/search/tmdb?q=matrix&year=1999&page=1
   - Pubblica
   - Usa tmdbService.searchMovies e ritorna il payload TMDB
======================================================================= */
router.get(
  '/search/tmdb',
  validate(searchMoviesQuerySchema, 'query'),
  searchTmdb
);

/* =======================================================================
   🔎 Lookup in cache per tmdbId
   GET /api/movies/by-tmdb/:tmdbId
   - Pubblica
   - Utile quando la UI ha l'id TMDB e deve sapere se è già in cache
======================================================================= */
router.get(
  '/by-tmdb/:tmdbId',
  validate(tmdbIdParamSchema, 'params'),
  getMovieByTmdbId
);

/* =======================================================================
   📚 Lista/ricerca dalla cache locale
   GET /api/movies?q=&year=&sortBy=&sortDir=&page=&limit=
   - Pubblica
   - Valida query con Joi (paginazione, ordinamenti whitelisted)
======================================================================= */
router.get(
  '/',
  validate(searchMoviesQuerySchema, 'query'),
  listMovies
);

/* =======================================================================
   🎬 Dettaglio film (cache locale) per ID interno
   GET /api/movies/:id
   - Pubblica
======================================================================= */
router.get(
  '/:id',
  validate(movieIdParamSchema, 'params'),
  getMovieById
);

/* =======================================================================
   👤 Stato UTENTE per un film (favorite/watchlist/rating/notes)
   GET /api/movies/:id/me
   - Autenticato
   - Ritorna movie.toPublic() + meta dell'utente (pivot UserMovie)
======================================================================= */
router.get(
  '/:id/me',
  requireAuth,
  validate(movieIdParamSchema, 'params'),
  getMyMovieMeta
);

/* =======================================================================
   Sync/Upsert da TMDB nella cache locale
   POST /api/movies/sync   { tmdbId, force? }
   - Autenticato + solo ADMIN
   - Se non esiste crea, altrimenti aggiorna se "stale" o force=true
======================================================================= */
router.post(
  '/sync',
  requireAuth,
  requireRole('admin'),
  validate(upsertMovieByTmdbBodySchema, 'body'),
  upsertMovieByTmdb
);

export default router;