import express from 'express';
import { verifyToken, requireRole } from '../middleware/authorization.js';
import { getMovies, getMovieById, createMovie, updateMovie, deleteMovie } from '../controllers/moviesController.js';

const router = express.Router();

/**
 * GET /api/movies
 * Opzioni di filtro (query string):
 * ?title=...&genre=...&director=...&release_date=...
 */
router.get('/', verifyToken, getMovies);
router.get('/:id', verifyToken, getMovieById);
router.post('/', verifyToken, createMovie);
router.put('/:id', verifyToken, updateMovie);
router.delete('/:id', verifyToken, deleteMovie);

export default router;
