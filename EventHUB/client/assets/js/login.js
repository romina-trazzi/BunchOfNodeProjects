console.log("Login page ready ✅");

const form = document.getElementById("loginForm");

/* ---------------------------
 * UTENTE GIA' LOGGATO, SALTA IL LOGIN
 * --------------------------- */
if (localStorage.getItem("accessToken")) {
  window.location.href = "assets/pages/dashboard.html";
}

/* ---------------------------
 * FORM SUBMIT
 * --------------------------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Compila tutti i campi!");
    return;
  }

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      // Salva token e dati utente in localStorage
      localStorage.setItem("accessToken", data.tokens.accessToken);
      localStorage.setItem("refreshToken", data.tokens.refreshToken);
      if (data.user?.id) localStorage.setItem("userId", data.user.id);
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("userRole", data.user.role);
      localStorage.setItem("userId", data.user.id);

      alert(`Bentornato, ${data.user.username}! 🎉`);
      // Redirect alla dashboard
      window.location.href = "assets/pages/dashboard.html";
    } else {
      alert(data.error || "Credenziali non valide ❌");
    }
  } catch (err) {
    console.error("Errore di rete:", err);
    alert("Errore di connessione al server");
  }
});