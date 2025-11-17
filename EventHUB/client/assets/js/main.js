console.log("Frontend ready ✅");

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Login avvenuto con successo ✅");
        console.log("Token:", data.token);
      } else {
        alert(data.error || "Credenziali non valide ❌");
      }
    } catch (err) {
      console.error("Errore durante il login:", err);
      alert("Errore di connessione al server");
    }
  });
}