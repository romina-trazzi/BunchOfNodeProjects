// src/controllers/movieController.js
// Controller MOVIES: ricerca/lista dalla cache locale + dettaglio per ID locale +
// upsert/sync da TMDB usando l'integrazione centralizzata in `integrations/tmdbService.js`.
//
// CONFIG .env rilevanti:
// - TMDB_BEARER_TOKEN=eyJ...          # consigliato (token v4 su Authorization: Bearer)
// - TMDB_API_KEY_V3=xxxxxxxxxxxxxxxx  # alternativa (v3 via query string)
// - TMDB_BASE_URL=https://api.themoviedb.org/3  # opzionale
// - TMDB_CACHE_TTL_DAYS=7                    # TTL cache locale (default 7)
// (Nota: prima usavamo fetch diretto; ora tutte le chiamate TMDB passano da tmdbService.)

import { Op } from 'sequelize';
import { Movie } from '../models/index.js';
import { getMovieDetails } from '../integrations/tmdbService.js';

/**
 * TTL cache (in giorni) per stabilire quando rinfrescare i dati dal TMDB.
 * Se lastSyncedAt è più vecchio di TTL, consideriamo la cache "stale".
 */
const TMDB_CACHE_TTL_DAYS = Number(process.env.TMDB_CACHE_TTL_DAYS || 7);

// ============================ Helpers interne ============================

/**
 * Ritorna true se la cache è "vecchia" (lastSyncedAt assente o oltre TTL giorni).
 */
function isStale(lastSyncedAt, ttlDays = TMDB_CACHE_TTL_DAYS) {
  if (!lastSyncedAt) return true;
  const ageMs = Date.now() - new Date(lastSyncedAt).getTime();
  const ttlMs = ttlDays * 24 * 60 * 60 * 1000;
  return ageMs > ttlMs;
}

/**
 * Mappa il payload TMDB /movie/{id} nei campi del nostro Model Movie.
 * Importante: salviamo solo il "path" delle immagini, non l'URL completo.
 */
function mapTmdbMovieToModelFields(tm) {
  if (!tm || !tm.id || !tm.title) {
    // Lascio uno status "parlante" che verrà gestito dall'error handler globale.
    throw Object.assign(new Error('Payload TMDB non valido'), { status: 502 });
  }

  return {
    tmdbId: tm.id,
    title: tm.title,
    originalTitle: tm.original_title ?? null,
    overview: tm.overview ?? null,
    releaseDate: tm.release_date || null, // DATEONLY accetta 'YYYY-MM-DD'
    originalLanguage: tm.original_language ?? null,
    runtime: typeof tm.runtime === 'number' ? tm.runtime : null,
    posterPath: tm.poster_path ?? null,
    backdropPath: tm.backdrop_path ?? null,
    popularity: typeof tm.popularity === 'number' ? tm.popularity : null,
    // vote_average su TMDB è 0..10 (float). Salviamo con 1 decimale.
    voteAverage: tm.vote_average != null ? Number(Number(tm.vote_average).toFixed(1)) : null,
    voteCount: typeof tm.vote_count === 'number' ? tm.vote_count : null,
    lastSyncedAt: new Date()
  };
}

// ============================ Controller actions ============================

/**
 * GET /api/movies
 * Ricerca nella cache locale:
 * - q: filtra per titolo (LIKE %q%)
 * - year: filtra per anno (releaseDate compresa nel range [year-01-01, year-12-31])
 * - sortBy: popularity|releaseDate|voteAverage|createdAt (default popularity)
 * - sortDir: asc|desc (default desc)
 * - page, limit: paginazione (default 1, 20)
 */
export async function listMovies(req, res, next) {
  try {
    const {
      q,
      year,
      sortBy = 'popularity',
      sortDir = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    const where = {};
    if (q) {
      where.title = { [Op.like]: `%${q}%` }; // NB: case-sensitivity dipende dalla collation del DB
    }
    if (year) {
      // Filtra per anno usando releaseDate (DATEONLY)
      const from = `${year}-01-01`;
      const to = `${year}-12-31`;
      where.releaseDate = { [Op.between]: [from, to] };
    }

    const offset = (page - 1) * limit;
    const order = [[sortBy, sortDir.toUpperCase()]];

    const { rows, count } = await Movie.findAndCountAll({
      where,
      order,
      offset,
      limit
    });

    res.json({
      page: Number(page),
      limit: Number(limit),
      total: count,
      items: rows.map(m => m.toPublic())
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/movies/:id
 * Ritorna un film dalla cache locale per ID interno.
 */
export async function getMovieById(req, res, next) {
  try {
    const { id } = req.params;
    const movie = await Movie.findByPk(id);
    if (!movie) return res.status(404).json({ error: 'Movie non trovato' });
    res.json(movie.toPublic());
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/movies/sync
 * Body: { tmdbId: number, force?: boolean }
 * Comporta:
 * - se il film NON esiste in cache → lo crea usando TMDB (201 Created).
 * - se ESISTE ma è "stale" (oltre TTL) **o** force=true → richiama TMDB e aggiorna (200).
 * - se ESISTE e NON è stale (e force=false) → restituisce quello in cache (200, no chiamata esterna).
 *
 * Ora le chiamate TMDB passano da `getMovieDetails` del nostro tmdbService,
 * che gestisce Authorization (Bearer/API key), errori noti (401/404/429/5xx) e local mapping.
 */
export async function upsertMovieByTmdb(req, res, next) {
  try {
    const { tmdbId, force = false } = req.body;

    // Cerca in cache
    let movie = await Movie.findOne({ where: { tmdbId } });

    // Se non esiste → fetch da TMDB e crea
    if (!movie) {
      const tm = await getMovieDetails(tmdbId, { language: 'it-IT' });
      const data = mapTmdbMovieToModelFields(tm);
      movie = await Movie.create(data);
      return res.status(201).json(movie.toPublic());
    }

    // Se esiste → valuta se è stale o se forzare il refresh
    if (force || isStale(movie.lastSyncedAt)) {
      const tm = await getMovieDetails(tmdbId, { language: 'it-IT' });
      const data = mapTmdbMovieToModelFields(tm);
      await movie.update(data);
      return res.json(movie.toPublic());
    }

    // Non stale e non forzato: ritorna la cache attuale
    return res.json(movie.toPublic());
  } catch (err) {
    next(err);
  }
}