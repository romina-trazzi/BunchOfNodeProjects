// Serve per proteggere le rotte che necessitano di un utente autenticato.

/*

1. Estrae il token dal header Authorization (es. Bearer <token>).
2- Verifica la validità del token usando jwt.verify().
3- Se valido, permette l'accesso alla risorsa protetta, altrimenti risponde con un errore.

*/

console.log("AUTH MIDDLEWARE CARICATO");

// Import jwt for verifying the token
const jwt = require("jsonwebtoken");

// Middleware to protect routes
function authenticateToken(req, res, next) {
  console.log("AUTH MIDDLEWARE CHIAMATO");
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Token is missing" });

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token is invalid" });
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;