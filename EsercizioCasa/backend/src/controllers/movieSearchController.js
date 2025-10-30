// src/controllers/movieSearchController.js
import { searchMovies } from '../services/tmdbService.js';

export async function searchTmdb(req, res, next) {
  try {
    const { q, page = 1, year } = req.query;
    // chiama TMDB e ritorna il payload così com'è (oppure mappalo se vuoi)
    const data = await searchMovies(q, { page: Number(page), year: year ? Number(year) : undefined, language: 'it-IT' });
    res.json(data);
  } catch (err) {
    next(err);
  }
}