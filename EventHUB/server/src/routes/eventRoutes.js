const express = require("express");
const router = express.Router();

const eventController = require("../controllers/eventController");
const authenticateToken = require("../middlewares/authMiddleware");

// POST crea evento
router.post("/", authenticateToken, eventController.createEvent);

// GET eventi dell’utente
router.get("/mine_events", authenticateToken, eventController.getMyEvents);

// DELETE elimina evento
router.delete("/:id", authenticateToken, eventController.deleteEvent);

// PUT aggiorna un evento
router.put("/:id", authenticateToken, eventController.updateEvent);

module.exports = router;