// client/assets/js/login.js
console.log("Login page ready ✅");

const form = document.getElementById("loginForm");

/* ---------------------------
 * If user already logged in, skip login page
 * --------------------------- */
if (localStorage.getItem("accessToken")) {
  window.location.href = "assets/pages/dashboard.html";
}

/* ---------------------------
 * Form submission handler
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
      // ✅ Save tokens locally
      localStorage.setItem("accessToken", data.tokens.accessToken);
      localStorage.setItem("refreshToken", data.tokens.refreshToken);
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("userRole", data.user.role);

      alert(`Bentornato, ${data.user.username}! 🎉`);
      // ✅ Redirect to dashboard
      window.location.href = "assets/pages/dashboard.html";
    } else {
      alert(data.error || "Credenziali non valide ❌");
    }
  } catch (err) {
    console.error("Errore di rete:", err);
    alert("Errore di connessione al server");
  }
});