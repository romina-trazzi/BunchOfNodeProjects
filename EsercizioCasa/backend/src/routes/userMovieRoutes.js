/*  src/routes/userMovieRoutes.js
// Route AUTENTICATE per gestire le preferenze utente sui film (tabella ponte UserMovie).

Espone endpoint autenticati:

GET /api/user/movies → lista dei film dell’utente (con filtri/paginazione)

POST /api/movies/:id/favorite → set/unset preferito

POST /api/movies/:id/watchlist → set/unset watchlist

POST /api/movies/:id/rating → imposta/rimuove rating

POST /api/movies/:id/notes → imposta/rimuove note

PATCH /api/user-movies/:id → patch combinato sul pivot UserMovie */


import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';

import {
  listUserMovies
, setFavorite
, setWatchlist
, setRating
, setNotes
, patchUserMovie
} from '../controllers/userMovieController.js';

import {
  listUserMoviesQuerySchema
, movieIdParamSchema
, setFavoriteBodySchema
, setWatchlistBodySchema
, setRatingBodySchema
, setNotesBodySchema
, userMovieIdParamSchema
, patchUserMovieBodySchema
} from '../validation/movieSchemas.js';

const router = Router();

// Tutte queste rotte richiedono utente loggato
router.use(requireAuth);

/**
 * GET /api/user/movies
 * Lista dei film dell'utente con filtri/paginazione.
 * Query validata con Joi.
 */
router.get(
  '/user/movies',
  validate(listUserMoviesQuerySchema, 'query'),
  listUserMovies
);

/**
 * POST /api/movies/:id/favorite  { favorite: true|false }
 * Imposta o rimuove il flag "favorite" per quel movieId locale.
 */
router.post(
  '/movies/:id/favorite',
  validate(movieIdParamSchema, 'params'),
  validate(setFavoriteBodySchema, 'body'),
  setFavorite
);

/**
 * POST /api/movies/:id/watchlist  { watchlist: true|false }
 * Imposta o rimuove il flag "watchlist" per quel movieId locale.
 */
router.post(
  '/movies/:id/watchlist',
  validate(movieIdParamSchema, 'params'),
  validate(setWatchlistBodySchema, 'body'),
  setWatchlist
);

/**
 * POST /api/movies/:id/rating  { rating: 1..10 | null }
 * Imposta un voto oppure lo rimuove con null.
 */
router.post(
  '/movies/:id/rating',
  validate(movieIdParamSchema, 'params'),
  validate(setRatingBodySchema, 'body'),
  setRating
);

/**
 * POST /api/movies/:id/notes  { notes: string | '' | null }
 * Imposta o svuota note personali.
 */
router.post(
  '/movies/:id/notes',
  validate(movieIdParamSchema, 'params'),
  validate(setNotesBodySchema, 'body'),
  setNotes
);

/**
 * PATCH /api/user-movies/:id  { favorite?, watchlist?, rating?, notes? }
 * Patch combinato sul record pivot (UserMovie.id).
 */
router.patch(
  '/user-movies/:id',
  validate(userMovieIdParamSchema, 'params'),
  validate(patchUserMovieBodySchema, 'body'),
  patchUserMovie
);

export default router;