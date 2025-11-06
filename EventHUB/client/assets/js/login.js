// login.js
console.log("Login page ready ✅");

const form = document.getElementById("loginForm");

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
      alert("Accesso effettuato con successo 🎉");
      console.log("Token:", data.token);
      // In futuro: salva token in localStorage e redirect a dashboard
    } else {
      alert(data.error || "Credenziali non valide ❌");
    }
  } catch (err) {
    console.error("Errore di rete:", err);
    alert("Errore di connessione al server");
  }
});