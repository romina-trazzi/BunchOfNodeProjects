console.log("Register page loaded ✅");

const form = document.getElementById("registerForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  if (password !== confirmPassword) {
    alert("Le password non coincidono!");
    return;
  }

  const userData = { username, email, password };

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Registrazione avvenuta con successo 🎉");
      window.location.href = "../../index.html";
   } else if (data.errors) {
      // ✅ Show validation messages
      alert(data.errors.map(e => e.msg).join("\n"))   
    } else {
      alert(data.error || "Errore durante la registrazione");
    }
  } catch (err) {
    console.error("Errore:", err);
    alert("Errore di connessione al server");
  }
});