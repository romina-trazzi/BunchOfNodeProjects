// src/docs/openapi.js

/**
 * @openapi
 * tags:
 *   - name: Movies
 *     description: Ricerca e cache locale dei film
 *   - name: UserMovies
 *     description: Preferenze utente sui film
 */

/**
 * @openapi
 * /api/movies:
 *   get:
 *     tags: [Movies]
 *     summary: Lista/ricerca film (cache locale)
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Testo da cercare nel titolo
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [popularity, releaseDate, voteAverage, createdAt], default: popularity }
 *       - in: query
 *         name: sortDir
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: OK
 */

/**
 * @openapi
 * /api/movies/{id}:
 *   get:
 *     tags: [Movies]
 *     summary: Dettaglio film (cache locale)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Movie non trovato
 */

/**
 * @openapi
 * /api/movies/sync:
 *   post:
 *     tags: [Movies]
 *     summary: Upsert/sync di un film da TMDB (solo admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tmdbId]
 *             properties:
 *               tmdbId: { type: integer }
 *               force: { type: boolean, default: false }
 *     responses:
 *       200: { description: Aggiornato }
 *       201: { description: Creato in cache }
 *       404: { description: Film TMDB non trovato }
 *       502: { description: Errore TMDB / rate limit }
 */

/**
 * @openapi
 * /api/user/movies:
 *   get:
 *     tags: [UserMovies]
 *     summary: Lista dei film dell'utente (watchlist/favorites/rating)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: favorite
 *         schema: { type: boolean }
 *       - in: query
 *         name: watchlist
 *         schema: { type: boolean }
 *       - in: query
 *         name: rated
 *         schema: { type: boolean }
 *       - in: query
 *         name: minRating
 *         schema: { type: integer }
 *       - in: query
 *         name: maxRating
 *         schema: { type: integer }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: OK }
 */

/**
 * @openapi
 * /api/movies/{id}/favorite:
 *   post:
 *     tags: [UserMovies]
 *     summary: Imposta/rimuove favorite per un film
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [favorite]
 *             properties:
 *               favorite: { type: boolean }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Movie non trovato }
 */

/**
 * @openapi
 * /api/movies/{id}/watchlist:
 *   post:
 *     tags: [UserMovies]
 *     summary: Imposta/rimuove watchlist per un film
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [watchlist]
 *             properties:
 *               watchlist: { type: boolean }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Movie non trovato }
 */

/**
 * @openapi
 * /api/movies/{id}/rating:
 *   post:
 *     tags: [UserMovies]
 *     summary: Imposta/rimuove rating per un film
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating]
 *             properties:
 *               rating: { type: integer, nullable: true, minimum: 1, maximum: 10 }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Movie non trovato }
 */

/**
 * @openapi
 * /api/movies/{id}/notes:
 *   post:
 *     tags: [UserMovies]
 *     summary: Imposta/rimuove note per un film
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [notes]
 *             properties:
 *               notes: { type: string, nullable: true, maxLength: 1000 }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Movie non trovato }
 */

/**
 * @openapi
 * /api/user-movies/{id}:
 *   patch:
 *     tags: [UserMovies]
 *     summary: Patch combinato sul pivot UserMovie
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               favorite: { type: boolean }
 *               watchlist: { type: boolean }
 *               rating: { type: integer, nullable: true, minimum: 1, maximum: 10 }
 *               notes: { type: string, nullable: true, maxLength: 1000 }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Pivot non trovato }
 */
/**
 * @openapi
 * /api/movies/by-tmdb/{tmdbId}:
 *   get:
 *     tags: [Movies]
 *     summary: Cerca un film in cache locale partendo dal tmdbId
 *     parameters:
 *       - in: path
 *         name: tmdbId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Non presente in cache }
 */

/**
 * @openapi
 * /api/movies/{id}/me:
 *   get:
 *     tags: [UserMovies]
 *     summary: Stato utente per un film (favorite/watchlist/rating/notes)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Movie non trovato }
 */