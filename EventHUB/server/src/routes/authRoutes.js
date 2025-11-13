// server/src/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { register, login, refreshToken } = require("../controllers/authController");
const authenticateToken = require("../middlewares/authMiddleware");

console.log("DEBUG authMiddleware IMPORT =", authenticateToken);
console.log("TYPE =", typeof authenticateToken);

// Route to register a new user
router.post(
  "/register",
  [
    body("username").isLength({ min: 6 }).withMessage("Username must be at least 6 characters long."),
    body("email").isEmail().withMessage("Please provide a valid email address."),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long."),
  ],
  register
);

// Route to login with username or password
router.post(
  "/login",
  [
    body("email")
      .notEmpty()
      .withMessage("Email or username is required."),
    body("password")
      .notEmpty()
      .withMessage("Password is required."),
  ],
  login
);

// Route to refresh access token using refresh token
router.post("/refresh", authenticateToken, refreshToken);

module.exports = router;