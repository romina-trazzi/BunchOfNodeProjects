const API_BASE_URL = "http://localhost:3000"; // backend locale
let accessToken = null;
let refreshToken = null;

// --- Utility ---
function showMessage(text, type = "info") {
  const msg = document.getElementById("messages");
  msg.textContent = text;
  msg.style.color = type === "error" ? "red" : "green";
  setTimeout(() => (msg.textContent = ""), 4000);
}

// --- FUNZIONE GENERICA PER FETCH PROTETTO ---
async function authFetch(url, options = {}) {
  if (!options.headers) options.headers = {};
  if (accessToken) options.headers['Authorization'] = `Bearer ${accessToken}`;

  let res = await fetch(url, options);

  // Se token scaduto, prova a rinnovarlo
  if (res.status === 403 && refreshToken) {
    const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    if (refreshRes.ok) {
      const refreshData = await refreshRes.json();
      accessToken = refreshData.accessToken;
      options.headers['Authorization'] = `Bearer ${accessToken}`;
      res = await fetch(url, options);
    }
  }

  return res;
}

// --- LOGIN ---
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Errore di login");

    accessToken = data.accessToken;
    refreshToken = data.refreshToken;

    showMessage("Login riuscito!");
    document.getElementById("authSection").classList.add("hidden");
    document.getElementById("profileSection").classList.remove("hidden");
    document.getElementById("tmdbSection").classList.remove("hidden");
    document.getElementById("moviesSection").classList.remove("hidden");

    getProfile();
  } catch (error) {
    showMessage(error.message, "error");
  }
});

// --- REGISTRAZIONE ---
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('regUsername').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value.trim();

  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Errore registrazione');

    showMessage('Registrazione riuscita! Puoi ora effettuare il login.');
  } catch (error) {
    showMessage(error.message, 'error');
  }
});

// --- PROFILO ---
async function getProfile() {
  try {
    const res = await authFetch(`${API_BASE_URL}/auth/profile`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Errore nel recupero profilo");

    // Mostro la card profilo
    const profileDiv = document.getElementById("profileData");
    profileDiv.innerHTML = `
      <p><strong>Username:</strong> ${data.username}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Ruolo:</strong> ${data.role}</p>
    `;

    // Mostro o nascondo sezioni in base al ruolo
    document.getElementById("tmdbSection").classList.remove("hidden");
    document.getElementById("authSection").classList.add("hidden");
    document.getElementById("profileSection").classList.remove("hidden");
    document.getElementById("moviesSection").classList.remove("hidden");

  } catch (error) {
    showMessage(error.message, "error");
  }
}



// --- LOGOUT ---
document.addEventListener("DOMContentLoaded", () => {
  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", async () => {
      try {
        if (!refreshToken) return showMessage("Nessun utente loggato", "error");

        const res = await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Errore nel logout");

        accessToken = null;
        refreshToken = null;

        showMessage("Logout effettuato! La pagina verrà ricaricata...");
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        showMessage(error.message, "error");
      }
    });
  }
});

// --- RICERCA FILM SU TMDB CON FILTRI ---
document.getElementById("searchForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("query").value.trim();
  const genre = document.getElementById("filterGenre").value.trim();
  const director = document.getElementById("filterDirector").value.trim();
  const year = document.getElementById("filterYear").value.trim();

  if (!title && !genre && !director && !year) return showMessage("Inserisci almeno un criterio di ricerca", "error");

  try {
    const params = new URLSearchParams();
    if (title) params.append("q", title);
    if (genre) params.append("genre", genre);
    if (director) params.append("director", director);
    if (year) params.append("year", year);

    const res = await authFetch(`${API_BASE_URL}/api/tmdb/search?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Errore ricerca TMDB");

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    if (data.length === 0) {
      resultsDiv.innerHTML = "<p>Nessun film trovato.</p>";
      return;
    }

    data.forEach((movie) => {
      const div = document.createElement("div");
      div.classList.add("movie-card");

      const poster = movie.poster_url || "https://via.placeholder.com/300x450?text=Nessuna+Immagine";

      div.innerHTML = `
        <img src="${poster}" alt="${movie.title}" />
        <h3>${movie.title}</h3>
        <div class="movie-info">
          <span class="director">Regista: ${movie.director || "N/D"}</span>
          <span class="release">Uscita: ${movie.release_date || "N/D"}</span>
          <span class="genre">Genere: ${movie.genre || "N/D"}</span>
        </div>
        <p>${movie.overview || "Nessuna descrizione disponibile"}</p>
        <button class="saveMovieBtn">Salva nel DB</button>
      `;
      resultsDiv.appendChild(div);

      div.querySelector(".saveMovieBtn").addEventListener("click", async () => {
        try {
          const saveRes = await authFetch(`${API_BASE_URL}/api/movies`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tmdb_id: movie.id,
              title: movie.title,
              genre: movie.genre || "",
              runtime: movie.runtime || null,
              cast: movie.cast || "",
              director: movie.director || "",
              description: movie.overview || "",
              release_date: movie.release_date || "",
              poster_path: movie.poster_url || ""
            })
          });

          const saveData = await saveRes.json();
          if (!saveRes.ok) throw new Error(saveData.error || "Errore salvataggio film");

          showMessage(`Film "${movie.title}" salvato nel DB!`);
        } catch (error) {
          showMessage(error.message, "error");
        }
      });
    });
  } catch (error) {
    showMessage(error.message, "error");
  }
});

// --- CARICA FILM DAL DATABASE LOCALE CON FILTRI ---
document.getElementById("btnLoadMovies")?.addEventListener("click", async () => {
  const title = document.getElementById("dbFilterTitle").value.trim();
  const genre = document.getElementById("dbFilterGenre").value.trim();
  const director = document.getElementById("dbFilterDirector").value.trim();
  const year = document.getElementById("dbFilterYear").value.trim();

  try {
    const params = new URLSearchParams();
    if (title) params.append("title", title);
    if (genre) params.append("genre", genre);
    if (director) params.append("director", director);
    if (year) params.append("year", year);

    const res = await authFetch(`${API_BASE_URL}/api/movies?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Errore caricamento film");

    const moviesList = document.getElementById("moviesList");
    moviesList.innerHTML = "";

    if (data.length === 0) {
      moviesList.innerHTML = "<p>Nessun film salvato nel database.</p>";
      return;
    }

    data.forEach((movie) => {
      const div = document.createElement("div");
      div.classList.add("movie-card");

      const poster = movie.poster_path || "https://via.placeholder.com/300x450?text=Nessuna+Immagine";

      div.innerHTML = `
        <img src="${poster}" alt="${movie.title}" />
        <h3>${movie.title}</h3>
        <div class="movie-info">
          <span class="genre">Genere: ${movie.genre || "N/D"}</span>
          <span class="director">Regista: ${movie.director || "N/D"}</span>
          <span class="release">Uscita: ${movie.release_date || "N/D"}</span>
        </div>
        <p>${movie.description || ""}</p>
        <button class="deleteMovieBtn">Elimina</button>
      `;

      div.querySelector(".deleteMovieBtn").addEventListener("click", async () => {
        try {
          const delRes = await authFetch(`${API_BASE_URL}/api/movies/${movie.id}`, {
            method: "DELETE",
          });
          const delData = await delRes.json();
          if (!delRes.ok) throw new Error(delData.error || "Errore eliminazione film");

          showMessage(`Film "${movie.title}" eliminato dal DB!`);
          div.remove();
        } catch (error) {
          showMessage(error.message, "error");
        }
      });

      moviesList.appendChild(div);
    });
  } catch (error) {
    showMessage(error.message, "error");
  }
});
