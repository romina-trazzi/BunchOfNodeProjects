// src/validation/movieSchemas.js
// Schemi di validazione per MOVIES (TMDB) e per il pivot UserMovie.
// - Validiamo sia ID interni (Movie.id) sia tmdbId (intero TMDB).
// - Supportiamo ricerca/paginazione/ordinamento base.
// - Gestiamo le azioni utente: watchlist/favorite/rating/notes.
//
// Uso tipico nelle routes:
//   import { validate } from '../middleware/validate.js';
//   import { movieIdParamSchema, tmdbIdParamSchema, searchMoviesQuerySchema, ... } from '../validation/movieSchemas.js';
//   router.get('/movies', validate(searchMoviesQuerySchema, 'query'), listMovies);
//   router.post('/movies/sync', validate(upsertMovieByTmdbBodySchema), syncFromTmdb);
//   router.post('/movies/:id/favorite', validate(movieIdParamSchema, 'params'), validate(setFavoriteBodySchema), setFavorite);
//   router.post('/tmdb/:tmdbId/watchlist', validate(tmdbIdParamSchema, 'params'), validate(setWatchlistBodySchema), setWatchlist);
//   router.patch('/user-movies/:id', validate(userMovieIdParamSchema, 'params'), validate(patchUserMovieBodySchema), patchUserMovie);

import Joi from 'joi';

// ====================== Costanti utili ======================

// Ordinamenti permessi per le liste (sicuri da esporre al client)
export const MOVIE_SORT_FIELDS = ['popularity', 'releaseDate', 'voteAverage', 'createdAt'];
export const SORT_DIRECTIONS = ['asc', 'desc'];

// Range del rating utente (pivot UserMovie)
export const USER_RATING_MIN = 1;
export const USER_RATING_MAX = 10;

// ====================== Schemi Params =======================

// PK interna dei nostri Movie (auto-increment integer > 0)
export const movieIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
}).label('MovieIdParams');

// tmdbId (ID numerico di TMDB, > 0)
export const tmdbIdParamSchema = Joi.object({
  tmdbId: Joi.number().integer().positive().required()
}).label('TmdbIdParams');

// PK interna del pivot UserMovie (se esponi endpoint diretti sul pivot)
export const userMovieIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
}).label('UserMovieIdParams');

// ====================== Query: ricerca/lista =======================

/**
 * Ricerca/Listaggio Movie:
 * - q: stringa di ricerca sul titolo (opzionale)
 * - year: filtro per anno di uscita (facoltativo)
 * - sortBy/sortDir: ordinamento sicuro (whitelist)
 * - page/limit: paginazione base
 */
export const searchMoviesQuerySchema = Joi.object({
  q: Joi.string().trim().min(1).max(200),
  year: Joi.number().integer().min(1878).max(2100), // 1878 ~ prime riprese storiche; cifra simbolica
  sortBy: Joi.string().valid(...MOVIE_SORT_FIELDS).default('popularity'),
  sortDir: Joi.string().valid(...SORT_DIRECTIONS).default('desc'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
}).label('SearchMoviesQuery');

// ====================== Body: sync/upsert da TMDB =======================

/**
 * Upsert (sync) di un film da TMDB:
 * - tmdbId richiesto
 * - force: true per forzare il refresh anche se cache recente
 */
export const upsertMovieByTmdbBodySchema = Joi.object({
  tmdbId: Joi.number().integer().positive().required(),
  force: Joi.boolean().default(false)
}).label('UpsertMovieByTmdbBody');

// ====================== Body: azioni utente (pivot UserMovie) =======================

/**
 * Imposta/aggiorna il flag "favorite".
 * Endpoint tipico: POST /movies/:id/favorite  { favorite: true/false }
 */
export const setFavoriteBodySchema = Joi.object({
  favorite: Joi.boolean().required()
}).label('SetFavoriteBody');

/**
 * Imposta/aggiorna il flag "watchlist".
 * Endpoint tipico: POST /movies/:id/watchlist  { watchlist: true/false }
 */
export const setWatchlistBodySchema = Joi.object({
  watchlist: Joi.boolean().required()
}).label('SetWatchlistBody');

/**
 * Imposta/aggiorna il rating (1..10) oppure lo rimuove (null).
 * Endpoint tipico: POST /movies/:id/rating  { rating: 7 }  // o { rating: null } per rimuovere
 */
export const setRatingBodySchema = Joi.object({
  rating: Joi.number()
    .integer()
    .min(USER_RATING_MIN)
    .max(USER_RATING_MAX)
    .allow(null) // consenti null per "cancellare" il voto
    .required()
}).label('SetRatingBody');

/**
 * Imposta/aggiorna le note utente (stringa breve). Vuoto o null per rimuovere.
 * Endpoint tipico: POST /movies/:id/notes  { notes: "bellissimo finale" }
 */
export const setNotesBodySchema = Joi.object({
  notes: Joi.string().trim().max(1000).allow('', null).required()
}).label('SetNotesBody');

/**
 * Patch combinato sul pivot UserMovie:
 * - Permette di aggiornare uno o più campi insieme.
 * - Richiede almeno un campo (min(1)).
 * Endpoint tipico: PATCH /user-movies/:id  { favorite, watchlist, rating, notes }
 */
export const patchUserMovieBodySchema = Joi.object({
  favorite: Joi.boolean(),
  watchlist: Joi.boolean(),
  rating: Joi.number().integer().min(USER_RATING_MIN).max(USER_RATING_MAX).allow(null),
  notes: Joi.string().trim().max(1000).allow('', null)
}).min(1).label('PatchUserMovieBody');

// ====================== Query: lista dei film dell'utente =======================

/**
 * Lista UserMovie dell'utente loggato (join con Movie opzionale lato controller):
 * - favorite/watchlist: filtri booleani
 * - rated: se vuoi filtrare solo quelli con rating presente (true) o assente (false)
 * - minRating/maxRating: range sul rating (se rated=true)
 * - page/limit: paginazione
 */
export const listUserMoviesQuerySchema = Joi.object({
  favorite: Joi.boolean(),
  watchlist: Joi.boolean(),
  rated: Joi.boolean(),
  minRating: Joi.number().integer().min(USER_RATING_MIN).max(USER_RATING_MAX),
  maxRating: Joi.number().integer().min(USER_RATING_MIN).max(USER_RATING_MAX),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
})
  // vincolo logico: se min/max presenti, hanno senso solo quando rated=true (opzionale—puoi anche controllarlo nel controller)
  .with('minRating', 'rated')
  .with('maxRating', 'rated')
  .label('ListUserMoviesQuery');



  /* Commento
  
  Abbiamo separato params (:id, :tmdbId) da body (favorite/watchlist/rating/notes) e query (ricerca/paginazione).
  upsertMovieByTmdbBodySchema serve per un endpoint che scarica o aggiorna in cache un film da TMDB a partire dal suo tmdbId.
  patchUserMovieBodySchema è comodo se vuoi un endpoint unico per aggiornare più campi del pivot in una volta. */