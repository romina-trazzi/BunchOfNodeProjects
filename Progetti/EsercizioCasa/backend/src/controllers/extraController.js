// src/controllers/movieExtrasController.js
// Endpoint extra per Movies:
// - getMyMovieMeta: stato utente (favorite/watchlist/rating/notes) per un movieId locale
// - getMovieByTmdbId: lookup di un film in cache a partire da tmdbId (senza toccare TMDB)

import { Movie, UserMovie } from '../models/index.js';

/**
 * GET /api/movies/:id/me
 * Richiede auth. Se il pivot non esiste, ritorna meta "vuota".
 */
export async function getMyMovieMeta(req, res, next) {
  try {
    const userId = req.user.id;
    const movieId = Number(req.params.id);

    const movie = await Movie.findByPk(movieId);
    if (!movie) return res.status(404).json({ error: 'Movie non trovato' });

    const pivot = await UserMovie.findOne({ where: { userId, movieId } });

    // Risposta coerente anche quando l’utente non ha ancora impostato nulla
    const userMeta = pivot
      ? pivot.toPublic()
      : { userId, movieId, favorite: false, watchlist: false, rating: null, notes: null };

    res.json({ movie: movie.toPublic(), userMeta });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/movies/by-tmdb/:tmdbId
 * Pubblico. Cerca in cache locale un film per tmdbId; se non c’è → 404.
 */
export async function getMovieByTmdbId(req, res, next) {
  try {
    const tmdbId = Number(req.params.tmdbId);
    const movie = await Movie.findOne({ where: { tmdbId } });
    if (!movie) return res.status(404).json({ error: 'Movie non presente in cache' });
    res.json(movie.toPublic());
  } catch (err) {
    next(err);
  }
}