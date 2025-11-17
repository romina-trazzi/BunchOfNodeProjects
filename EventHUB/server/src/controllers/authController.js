
const { User } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateTokens");

/* ============================
   USER REGISTRATION
============================ */
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // Utente già esistente (verifica mail)
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Creazione nuovo utente
    const newUser = await User.create({
      username,
      email,
      passwordHash: hashedPassword,
      role: "USER", 
    });

    console.log("✅ New user created:", newUser.username);

    // Generate JWT tokens
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      tokens: { accessToken, refreshToken },
    });
  } catch (err) {
    console.error("🔥 Error during registration:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ============================
   USER LOGIN (email OR username)
============================ */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body; // nome o email

    if (!email || !password) {
      return res.status(400).json({ error: "Email/Username and password are required" });
    }

    // Mail o username?
    const isEmail = email.includes("@");

    // Trova utente per email
    const whereClause = isEmail ? { email } : { username: email };
    const user = await User.findOne({ where: whereClause });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compara password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Genera token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      message: "Login successful",
      tokens: { accessToken, refreshToken },
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("🔥 Error during login:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* ============================
   REFRESH TOKEN
============================ */
exports.refreshToken = (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
      return res.status(403).json({ error: "Refresh token is missing" });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: "Refresh token is invalid" });
      }

      const accessToken = generateAccessToken(user);
      res.json({ accessToken });
    });
  } catch (err) {
    console.error("🔥 Error during token refresh:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
