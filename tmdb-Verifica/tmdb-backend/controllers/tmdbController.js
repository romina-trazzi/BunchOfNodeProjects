import fetch from 'node-fetch';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// --- RICERCA FILM SU TMDB CON FILTRI ---
export const searchMovies = async (req, res, next) => {
  try {
    const { q, genre, director, year } = req.query;
    if (!q || q.trim() === '') {
      return res.status(400).json({ error: 'Parametro query mancante' });
    }

    // Ricerca film su TMDB
    const searchResponse = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(q)}`
    );
    const searchData = await searchResponse.json();

    if (!searchData.results || searchData.results.length === 0) {
      return res.status(404).json({ error: 'Nessun film trovato' });
    }

    // Recupera dettagli aggiuntivi (regista, generi)
    const moviesWithDetails = await Promise.all(
      searchData.results.map(async (movie) => {
        try {
          const detailsResponse = await fetch(
            `${TMDB_BASE_URL}/movie/${movie.id}?api_key=${TMDB_API_KEY}&append_to_response=credits`
          );
          const detailsData = await detailsResponse.json();

          // Estrazione regista
          const movieDirector =
            detailsData.credits?.crew?.find((c) => c.job === 'Director')?.name || 'Non disponibile';

          // Filtri
          if (genre && !detailsData.genres.some((g) => g.name.toLowerCase() === genre.toLowerCase())) return null;
          if (director && !movieDirector.toLowerCase().includes(director.toLowerCase())) return null;
          if (year && !detailsData.release_date?.startsWith(year)) return null;

          return {
            id: movie.id,
            title: movie.title,
            overview: movie.overview,
            release_date: detailsData.release_date,
            poster_url: detailsData.poster_path
              ? `https://image.tmdb.org/t/p/w500${detailsData.poster_path}`
              : null,
            genre: detailsData.genres.map((g) => g.name).join(', '),
            director: movieDirector
          };
        } catch {
          return {
            id: movie.id,
            title: movie.title,
            overview: movie.overview,
            release_date: movie.release_date,
            poster_url: movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : null,
            genre: '',
            director: 'Non disponibile'
          };
        }
      })
    );

    // Rimuovo eventuali null causati dai filtri
    const filteredMovies = moviesWithDetails.filter((m) => m !== null);

    res.status(200).json(filteredMovies);
  } catch (error) {
    next(error);
  }
};
