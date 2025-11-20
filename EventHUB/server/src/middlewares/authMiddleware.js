// Serve per proteggere le rotte che necessitano di un utente autenticato.

/*

1. Estrae il token dal header Authorization (es. Bearer <token>).
2- Verifica la validità del token usando jwt.verify().
3- Se valido, permette l'accesso alla risorsa protetta, altrimenti risponde con un errore.

*/

console.log("AUTH MIDDLEWARE CARICATO");

const jwt = require("jsonwebtoken");
const { User } = require("../models");

async function authenticateToken(req, res, next) {
  console.log("AUTH MIDDLEWARE CHIAMATO");
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Token is missing" });

  try {
    const user = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = user;

    if (user && user.id) {
      const dbUser = await User.findByPk(user.id);
      if (dbUser && dbUser.isBlocked) {
        return res.status(403).json({ error: "Account bloccato" });
      }
    }

    next();
  } catch (err) {
    return res.status(403).json({ error: "Token is invalid" });
  }
}

module.exports = authenticateToken;