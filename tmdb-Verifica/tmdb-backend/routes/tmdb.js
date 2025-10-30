import express from 'express';
import { searchMovies } from '../controllers/tmdbController.js';
import { verifyToken } from '../middleware/authorization.js';

const router = express.Router();

// GET /api/tmdb/search?q=nomeFilm&genre=Genere&director=Regista&year=Anno
router.get('/search', verifyToken, searchMovies);

export default router;
