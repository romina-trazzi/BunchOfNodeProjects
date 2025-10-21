// src/routes/index.js
// Monta tutte le route dell'app in un unico punto.

import authRoutes from './authRoutes.js';
import taskRoutes from './taskRoutes.js';

import movieRoutes from './movieRoutes.js';
import userMovieRoutes from './userMovieRoutes.js';

export function registerRoutes(app) {
  // Rotte pubbliche
  app.use('/api/movies', movieRoutes); // GET list/detail + POST /sync (admin)
  // Rotte che richiedono auth (watchlist/favorite/rating/notes)
  app.use('/api', userMovieRoutes);

  // Il resto della tua app
  app.use('/api/auth', authRoutes);
  app.use('/api/tasks', taskRoutes);
}