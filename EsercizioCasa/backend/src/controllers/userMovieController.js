// src/controllers/userMovieController.js
import { Op } from 'sequelize';
import { UserMovie, Movie } from '../models/index.js';

/* Gestisce le preferenze dell’utente sui film (tabella ponte UserMovie):

1. lista dei film dell’utente con filtri/paginazione

2. set/unset di favorite, watchlist, rating, notes usando movie id locale

3. patch combinato usando l’id del pivot (UserMovie.id)

Cosa aspettarti

1. Tutte le azioni richiedono utente loggato (usa requireAuth nelle route).

2. Se il movieId non esiste → 404 “Movie non trovato”.

3. listUserMovies ritorna elementi con struttura JSON:

{
  "movie": { ...campi public del Movie... },
  "userMeta": { "userId": 1, "movieId": 42, "favorite": true, ... }
}

Note:

- rating può essere null per rimuovere il voto.
- notes vuoto o null ⇒ memorizzato come null.

*/

/* ============================================
   Helpers interni
============================================ */

/**
 * Trova un Movie per ID locale; se assente -> 404.
 */
async function requireMovieOr404(movieId, res) {
  const movie = await Movie.findByPk(movieId);
  if (!movie) {
    res.status(404).json({ error: 'Movie non trovato' });
    return null;
  }
  return movie;
}

/**
 * Trova (o crea) il pivot UserMovie per (userId, movieId).
 * - Se non esiste, lo crea con valori di default (favorite/watchlist false).
 * - Restituisce l'istanza del pivot.
 */
async function getOrCreateUserMovie(userId, movieId) {
  const [pivot] = await UserMovie.findOrCreate({
    where: { userId, movieId },
    defaults: { favorite: false, watchlist: false, rating: null, notes: null }
  });
  return pivot;
}

/**
 * Normalizza la risposta combinando movie + meta utente (pivot).
 */
function toUserMovieResponse(movieInstance, userMovieInstance) {
  return {
    movie: movieInstance?.toPublic?.() ?? null,
    userMeta: userMovieInstance?.toPublic?.() ?? null
  };
}

/* ============================================
   LISTA dei film dell'utente loggato
   GET /api/user/movies
   Query (validata da Joi): favorite, watchlist, rated, minRating, maxRating, page, limit
============================================ */
export async function listUserMovies(req, res, next) {
  try {
    const userId = req.user.id;
    const {
      favorite,
      watchlist,
      rated,
      minRating,
      maxRating,
      page = 1,
      limit = 20
    } = req.query;

    // Costruisci filtro sul pivot UserMovie
    const where = { userId };

    if (typeof favorite === 'boolean') where.favorite = favorite;
    if (typeof watchlist === 'boolean') where.watchlist = watchlist;

    // rated: true => rating NOT NULL, rated: false => rating IS NULL
    if (typeof rated === 'boolean') {
      where.rating = rated ? { [Op.not]: null } : null;
    }

    // Range rating (valido solo se filtriamo rated=true, ma è già validato a livello Joi)
    if (minRating != null || maxRating != null) {
      where.rating = {
        ...(where.rating || {}),
        ...(minRating != null ? { [Op.gte]: Number(minRating) } : {}),
        ...(maxRating != null ? { [Op.lte]: Number(maxRating) } : {})
      };
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { rows, count } = await UserMovie.findAndCountAll({
      where,
      include: [{ model: Movie, as: 'Movie' }], // Sequelize crea alias col nome del model (ma sotto estraiamo direttamente)
      order: [['createdAt', 'DESC']],
      offset,
      limit: Number(limit)
    });

    // Mappa risposta combinando Movie + meta utente
    const items = rows.map(pivot => {
      const movie = pivot.get('Movie'); // include
      return toUserMovieResponse(movie, pivot);
    });

    res.json({
      page: Number(page),
      limit: Number(limit),
      total: count,
      items
    });
  } catch (err) {
    next(err);
  }
}

/* ============================================
   FAVORITE
   POST /api/movies/:id/favorite  { favorite: true|false }
============================================ */
export async function setFavorite(req, res, next) {
  try {
    const userId = req.user.id;
    const movieId = Number(req.params.id);
    const { favorite } = req.body;

    const movie = await requireMovieOr404(movieId, res);
    if (!movie) return;

    const pivot = await getOrCreateUserMovie(userId, movieId);
    pivot.favorite = !!favorite;
    await pivot.save();

    res.json(toUserMovieResponse(movie, pivot));
  } catch (err) {
    next(err);
  }
}

/* ============================================
   WATCHLIST
   POST /api/movies/:id/watchlist  { watchlist: true|false }
============================================ */
export async function setWatchlist(req, res, next) {
  try {
    const userId = req.user.id;
    const movieId = Number(req.params.id);
    const { watchlist } = req.body;

    const movie = await requireMovieOr404(movieId, res);
    if (!movie) return;

    const pivot = await getOrCreateUserMovie(userId, movieId);
    pivot.watchlist = !!watchlist;
    await pivot.save();

    res.json(toUserMovieResponse(movie, pivot));
  } catch (err) {
    next(err);
  }
}

/* ============================================
   RATING
   POST /api/movies/:id/rating  { rating: 1..10 | null }
============================================ */
export async function setRating(req, res, next) {
  try {
    const userId = req.user.id;
    const movieId = Number(req.params.id);
    const { rating } = req.body; // integer 1..10 oppure null (validato da Joi)

    const movie = await requireMovieOr404(movieId, res);
    if (!movie) return;

    const pivot = await getOrCreateUserMovie(userId, movieId);
    pivot.rating = rating === null ? null : Number(rating);
    await pivot.save();

    res.json(toUserMovieResponse(movie, pivot));
  } catch (err) {
    next(err);
  }
}

/* ============================================
   NOTES
   POST /api/movies/:id/notes  { notes: string | '' | null }
============================================ */
export async function setNotes(req, res, next) {
  try {
    const userId = req.user.id;
    const movieId = Number(req.params.id);
    const { notes } = req.body; // stringa breve oppure ''/null per rimuovere

    const movie = await requireMovieOr404(movieId, res);
    if (!movie) return;

    const pivot = await getOrCreateUserMovie(userId, movieId);
    pivot.notes = (notes === '' || notes === null) ? null : String(notes);
    await pivot.save();

    res.json(toUserMovieResponse(movie, pivot));
  } catch (err) {
    next(err);
  }
}

/* ============================================
   PATCH combinato sul PIVOT
   PATCH /api/user-movies/:id  { favorite?, watchlist?, rating?, notes? }
============================================ */
export async function patchUserMovie(req, res, next) {
  try {
    const userId = req.user.id;
    const userMovieId = Number(req.params.id);
    const { favorite, watchlist, rating, notes } = req.body;

    // Trova il pivot dell'utente (no escalation su altri utenti)
    const pivot = await UserMovie.findOne({ where: { id: userMovieId, userId } });
    if (!pivot) return res.status(404).json({ error: 'UserMovie non trovato' });

    // Applica solo i campi presenti (sono già validati da Joi)
    if (favorite !== undefined) pivot.favorite = !!favorite;
    if (watchlist !== undefined) pivot.watchlist = !!watchlist;
    if (rating !== undefined) pivot.rating = (rating === null) ? null : Number(rating);
    if (notes !== undefined) pivot.notes = (notes === '' || notes === null) ? null : String(notes);

    await pivot.save();

    // Includiamo il movie per dare una risposta completa
    const movie = await Movie.findByPk(pivot.movieId);
    res.json(toUserMovieResponse(movie, pivot));
  } catch (err) {
    next(err);
  }
}

