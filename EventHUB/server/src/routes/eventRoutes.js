const express = require("express");
const router = express.Router();

const { createEvent, getMyEvents } = require("../controllers/eventController");
const authenticateToken = require("../middlewares/authMiddleware");

// POST
router.post("/", authenticateToken, createEvent);

// GET
router.get("/mine_events", authenticateToken, getMyEvents);

module.exports = router;