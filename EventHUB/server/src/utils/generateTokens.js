// Importing jwt library
const jwt = require("jsonwebtoken");

// Function to generate access token
function generateAccessToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role }, // Payload (user info)
    process.env.JWT_ACCESS_SECRET,     // Secret key (stored in .env)
    { expiresIn: "15m" }              // Access token expires in 15 minutes
  );
}

// Function to generate refresh token
function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id }, // Only user id is stored in refresh token
    process.env.JWT_REFRESH_SECRET, // Secret key (stored in .env)
    { expiresIn: "7d" }            // Refresh token expires in 7 days
  );
}

module.exports = { generateAccessToken, generateRefreshToken };