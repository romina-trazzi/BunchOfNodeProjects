// server/src/routes/protectedRoutes.js

/* 
    La rotta /profile è protetta dal middleware authenticateToken.
    Se l'utente non è autenticato (ovvero se il token è mancante o invalido), riceverà un errore 401 Unauthorized.
    Se il token è valido, i dati dell’utente (presi dal token) vengono restituiti nella risposta.

*/


const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");

// Example of a protected route
router.get("/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Profile data accessed",
    user: req.user, // Data from the token (user id, role, etc.)
  });
});

module.exports = router;