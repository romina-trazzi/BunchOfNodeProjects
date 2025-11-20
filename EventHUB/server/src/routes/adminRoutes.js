const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const adminUserController = require("../controllers/adminUserController");

// Importiamo i middleware
const authenticateToken = require("../middlewares/authMiddleware");
const isAdmin = require("../middlewares/isAdmin");

// Rotta di test per l'admin
router.get("/test", authenticateToken, isAdmin, (req, res) => {
  res.json({
    message: "Accesso admin riuscito ✔️",
    user: req.user
  });
});

// Approva un evento
router.put("/events/:id/approve", authenticateToken, isAdmin, eventController.approveEvent);

// Rifiuta un evento
router.put("/events/:id/reject", authenticateToken, isAdmin, eventController.rejectEvent);

// Lista eventi in attesa di approvazione (pending)
router.get("/events/pending", authenticateToken, isAdmin, eventController.getPendingEvents);

// Gestione utenti: lista/blocco/sblocco
router.get("/users", authenticateToken, isAdmin, adminUserController.listUsers);
router.put("/users/:id/block", authenticateToken, isAdmin, adminUserController.blockUser);
router.put("/users/:id/unblock", authenticateToken, isAdmin, adminUserController.unblockUser);

module.exports = router;