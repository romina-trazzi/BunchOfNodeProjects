// src/integrations/tmdbService.js
// Client minimale per TMDB, con gestione errori e due modalità d'autenticazione:
// - Bearer token v4 (consigliato):   TMDB_BEARER_TOKEN='eyJ...'
// - Api key v3 via query string:     TMDB_API_KEY='xxxxxxxxxxxxxxxx'
//
// ENDPOINT base (di default): https://api.themoviedb.org/3
// Nota: usiamo fetch nativo (Node 18+). Se sei su Node <18 serve un polyfill.

/* Commenti

Piccolo service per TMDB: costruisce le URL, aggiunge l’autenticazione, gestisce errori comuni e fornisce funzioni comode (dettaglio film, ricerca).
Supporta sia Bearer token v4 (TMDB_BEARER_TOKEN) sia API key v3 (TMDB_API_KEY). */


const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN || process.env.TMDB_API_KEY || ''; // retrocompat
const TMDB_API_KEY_V3 = process.env.TMDB_API_KEY_V3 || ''; // opzionale, separato se vuoi usare v3 per query param

/**
 * Costruisce una URL TMDB con eventuali query param.
 */
function buildUrl(path, params = {}) {
  const url = new URL(path.replace(/^\//, ''), TMDB_BASE_URL + '/');
  // Se NON usiamo Bearer, ma api key v3, aggiungila come query param.
  if (!TMDB_BEARER_TOKEN && TMDB_API_KEY_V3) {
    params.api_key = TMDB_API_KEY_V3;
  }
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  });
  return url.toString();
}

/**
 * Esegue fetch con headers corretti e mappa errori comuni in eccezioni "parlanti".
 */
async function tmdbFetch(path, { params = {}, language = 'it-IT', method = 'GET' } = {}) {
  const url = buildUrl(path, { language, ...params });

  const headers = {};
  // Se abbiamo un bearer (token v4 o un token compatibile) usiamolo su Authorization
  if (TMDB_BEARER_TOKEN) headers.Authorization = `Bearer ${TMDB_BEARER_TOKEN}`;

  const res = await fetch(url, { method, headers });

  if (!res.ok) {
    let message = `TMDB error ${res.status}`;
    try {
      const data = await res.json();
      // TMDB spesso restituisce { status_message, status_code }
      message = data?.status_message || data?.message || message;
    } catch {
      // ignore JSON parse error
    }

    // Mappiamo alcuni casi comuni a status locali utili per il nostro error handler
    const mapped = {
      401: 502, // bad gateway verso servizio esterno (key errata o scaduta)
      403: 502,
      404: 404, // film non trovato
      429: 502, // rate limit superato
    }[res.status] ?? 502;

    const err = new Error(message);
    err.status = mapped;
    err.name = 'TmdbError';
    err.originStatus = res.status;
    err.url = url;
    throw err;
  }

  return res.json();
}

/**
 * Dettaglio film: /movie/{tmdbId}
 */
export async function getMovieDetails(tmdbId, { language = 'it-IT' } = {}) {
  if (!tmdbId || Number(tmdbId) <= 0) {
    const err = new Error('tmdbId non valido');
    err.status = 400;
    throw err;
  }
  return tmdbFetch(`/movie/${tmdbId}`, { language });
}

/**
 * Ricerca film: /search/movie
 * params: { query, page, year }
 */
export async function searchMovies(query, { page = 1, year, language = 'it-IT' } = {}) {
  if (!query || String(query).trim().length === 0) {
    const err = new Error('Query di ricerca vuota');
    err.status = 400;
    throw err;
  }
  return tmdbFetch('/search/movie', { language, params: { query, page, year } });
}

/**
 * (Utility) Costruisce un URL immagine a partire da un path TMDB.
 * Nota: in produzione potresti voler interrogare /configuration per sizes dinamici.
 */
export function buildImageUrl(path, size = 'w500') {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}