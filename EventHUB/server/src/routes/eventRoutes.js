const express = require('express');
const router = express.Router();

const { createEvent } = require('../controllers/eventController');
const authMiddleware = require("../middlewares/authMiddleware");

console.log("DEBUG> createEvent =", createEvent);
console.log("DEBUG> authMiddleware =", authMiddleware);

// POST /api/events
router.post('/', authMiddleware, createEvent);

module.exports = router;