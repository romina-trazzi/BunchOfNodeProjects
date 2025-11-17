const express = require("express");
const router = express.Router();

const eventController = require("../controllers/eventController");
const authenticateToken = require("../middlewares/authMiddleware");

// CRUD
router.post("/", authenticateToken, eventController.createEvent);
router.get("/mine_events", authenticateToken, eventController.getMyEvents);
router.put("/:id", authenticateToken, eventController.updateEvent);
router.delete("/:id", authenticateToken, eventController.deleteEvent);

// Catalogo
router.get("/", authenticateToken, eventController.getAllEvents);

// Iscrizioni
router.get("/subscribed", authenticateToken, eventController.getSubscribedEvents);
router.post("/:id/subscribe", authenticateToken, eventController.subscribeToEvent);
router.delete("/:id/unsubscribe", authenticateToken, eventController.unsubscribeFromEvent);

// Messaggi chat

// CHAT: ottieni messaggi dell'evento
router.get("/:id/messages", authenticateToken, eventController.getEventMessages);

// CHAT: invia un messaggio
router.post("/:id/messages", authenticateToken, eventController.sendMessageToEvent);



module.exports = router;
