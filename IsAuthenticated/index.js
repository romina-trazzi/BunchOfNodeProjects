const express = require("express");
const session = require("express-session");
const path = require("path");
const bcrypt = require("bcrypt"); 

const PORT = 3000;
const app = express();


let utente = null;

app.use(express.urlencoded({ extended: false }));

// Configurazione della sessione
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, 
      httpOnly: true,
      maxAge: 15 * 60 * 1000
    },
  })
);

// Middleware per verificare autenticazione
function isAuthorized(req, res, next) {
  if (req.session?.user) {
    return next();
  }
  return res.status(401).send("Non sei autenticato.");
}

// Controllo robustezza password
function passwordIsValid(password) {
  if (password.length < 8) return { ok: false, error: "La password deve avere minimo 8 caratteri" };
  if (!/[A-Z]/.test(password)) return { ok: false, error: "La password deve contenere almeno una maiuscola" };
  if (!/[a-z]/.test(password)) return { ok: false, error: "La password deve contenere almeno una minuscola" };
  if (!/\d/.test(password)) return { ok: false, error: "La password deve contenere e almeno un numero" };
  return { ok: true };
}

// Rotta base 
app.get("/", (req, res) => {
  res.redirect("/login")
});

// Login page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

// Post (submit dei dati)
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Se non esiste ancora l'utente controlla la password, se non è valida restituisci errore
  if (!utente) {
    const check = passwordIsValid(password);
    if (!check.ok) {
      return res.status(400).send(check.error);
    }

    // Hash della password
    const hash = await bcrypt.hash(password, 10);
    utente = { username, passwordHash: hash };
    console.log("Creato nuovo utente:", username);
    console.log("Password hash:", hash);
  }

  // Controllo username
  if (username !== utente.username) {
    return res.status(401).send("Credenziali non valide");
  }

  // Controllo password
  const match = await bcrypt.compare(password, utente.passwordHash);
  if (!match) {
    return res.status(401).send("Credenziali non valide");
  }

  // Salva utente in sessione
  req.session.user = { username };
  console.log("Login effettuato da:", username);

  res.redirect("/dashboard");
});

// Dashboard protetta
app.get("/dashboard", isAuthorized, (req, res) => {
  res.sendFile(path.join(__dirname, "dashboard.html"));
});

// Logout
app.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

// Avvio server
app.listen(PORT, () => {
  console.log(`Server attivo su http://localhost:${PORT}`);
});