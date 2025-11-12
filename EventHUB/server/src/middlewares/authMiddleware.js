// Serve per proteggere le rotte che necessitano di un utente autenticato.

/*

1. Estrae il token dal header Authorization (es. Bearer <token>).
2- Verifica la validità del token usando jwt.verify().
3- Se valido, permette l'accesso alla risorsa protetta, altrimenti risponde con un errore.

*/

// Import jwt for verifying the token
const jwt = require("jsonwebtoken");

// Middleware to protect routes
function authenticateToken(req, res, next) {
  // Get the token from the Authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // 'Bearer token'
  if (!token) return res.status(401).json({ error: "Token is missing" });

  // Verify the token
  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token is invalid" });
    req.user = user; // Store user info in request object
    next(); // Continue to the next middleware or route handler
  });
}

module.exports = { authenticateToken };