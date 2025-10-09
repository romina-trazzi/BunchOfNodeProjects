const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Demo user
const USER = { username: "romy", password: "secret" };

// Accetta form-url-encoded e JSON (grazie ai parser in index.js)
router.post("/", (req, res) => {
  const { username, password } = req.body || {};
  if (username === USER.username && password === USER.password) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "15m" });
    return res.json({ message: "Login ok", token });
  }
  return res.status(401).json({ error: "Credenziali non valide" });
});

module.exports = router;