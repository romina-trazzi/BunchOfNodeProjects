/**
 * EVENT CONTROLLER 
 * -------------------------
 * Gestisce:
 *  - CRUD eventi
 *  - Filtri catalogo
 *  - Iscrizione / disiscrizione
 *  - Eventi pending per admin
 *  - Approvazione / Rifiuto eventi
 *  - Chat in tempo reale (socket.io via req.app.get("io"))
 */

const { Event, User, Registration, Message } = require("../models");
const { Op } = require("sequelize");

/* ============================================================
   CREA EVENTO
   - USER → PENDING
   - ADMIN → APPROVED
   - Organizzatore automaticamente iscritto
============================================================ */
exports.createEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    const status = role === "ADMIN" ? "APPROVED" : "PENDING";

    const {
      title,
      description,
      startsAt,
      capacity,
      category,
      location,
      imageUrl
    } = req.body;

    const event = await Event.create({
      ownerId: userId,
      title,
      description,
      startsAt,
      capacity,
      category,
      location,
      imageUrl,
      status
    });

    // Organizzatore → iscritto automaticamente
    await Registration.create({
      userId,
      eventId: event.id
    });

    return res.status(201).json({
      message: "Evento creato con successo",
      event
    });

  } catch (err) {
    console.error("Errore createEvent:", err);
    res.status(500).json({ error: "Errore durante la creazione dell'evento" });
  }
};



/* ============================================================
   CATALOGO EVENTI PUBBLICI APPROVATI + FILTRI
============================================================ */
exports.getAllEvents = async (req, res) => {
  try {
    const { title, month, category, location } = req.query;

    const where = { status: "APPROVED" };

    if (title) where.title = { [Op.iLike]: `%${title}%` };
    if (category) where.category = category;
    if (location) where.location = { [Op.iLike]: `%${location}%` };

    if (month) {
      where.startsAt = {
        [Op.and]: [
          Event.sequelize.where(
            Event.sequelize.fn("to_char", Event.sequelize.col("startsAt"), "MM"),
            month
          )
        ]
      };
    }

    const events = await Event.findAll({
      where,
      order: [["startsAt", "ASC"]]
    });

    res.json(events);

  } catch (err) {
    console.error("Errore getAllEvents:", err);
    res.status(500).json({ error: "Errore nel recupero eventi" });
  }
};



/* ============================================================
   EVENTI CREATI DALL'UTENTE
============================================================ */
exports.getMyEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      where: { ownerId: req.user.id },
      order: [["startsAt", "ASC"]]
    });

    res.json(events);

  } catch (err) {
    console.error("Errore getMyEvents:", err);
    res.status(500).json({ error: "Errore nel recupero degli eventi" });
  }
};



/* ============================================================
   EVENTI A CUI L'UTENTE È ISCRITTO
============================================================ */
exports.getSubscribedEvents = async (req, res) => {
  try {
    const registrations = await Registration.findAll({
      where: { userId: req.user.id },
      include: [{ model: Event }]
    });

    const events = registrations.map(r => r.Event);
    res.json(events);

  } catch (err) {
    console.error("Errore getSubscribedEvents:", err);
    res.status(500).json({ error: "Errore nel recupero degli eventi iscritti" });
  }
};



/* ============================================================
   MODIFICA EVENTO
============================================================ */
exports.updateEvent = async (req, res) => {
  try {
    const id = req.params.id;

    const event = await Event.findByPk(id);
    if (!event) return res.status(404).json({ error: "Evento non trovato" });

    if (event.ownerId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Non autorizzato" });
    }

    await event.update(req.body);

    res.json({
      message: "Evento aggiornato",
      event
    });

  } catch (err) {
    console.error("Errore updateEvent:", err);
    res.status(500).json({ error: "Errore nella modifica dell’evento" });
  }
};



/* ============================================================
   CANCELLA EVENTO
============================================================ */
exports.deleteEvent = async (req, res) => {
  try {
    const id = req.params.id;

    const event = await Event.findByPk(id);
    if (!event) return res.status(404).json({ error: "Evento non trovato" });

    if (event.ownerId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Non autorizzato" });
    }

    await event.destroy();
    res.json({ message: "Evento eliminato" });

  } catch (err) {
    console.error("Errore deleteEvent:", err);
    res.status(500).json({ error: "Errore cancellazione evento" });
  }
};



/* ============================================================
   ISCRIZIONE AD UN EVENTO (notifica Socket.io)
============================================================ */
exports.subscribeToEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;

    const io = req.app.get("io"); // <- socket.io dal server

    const event = await Event.findByPk(eventId);
    if (!event) return res.status(404).json({ error: "Evento non trovato" });

    const exists = await Registration.findOne({ where: { userId, eventId }});
    if (exists) return res.json({ message: "Già iscritto" });

    await Registration.create({ userId, eventId });

    io.to(eventId).emit("new-registration", { eventId, userId });

    res.json({ message: "Iscrizione avvenuta" });

  } catch (err) {
    console.error("Errore subscribeToEvent:", err);
    res.status(500).json({ error: "Errore iscrizione" });
  }
};



/* ============================================================
   DISISCRIZIONE EVENTO (notifica Socket.io)
============================================================ */
exports.unsubscribeFromEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;

    const io = req.app.get("io");

    const reg = await Registration.findOne({ where: { userId, eventId }});
    if (!reg) return res.json({ message: "Non eri iscritto" });

    await reg.destroy();

    io.to(eventId).emit("user-unsubscribed", { eventId, userId });

    res.json({ message: "Disiscrizione avvenuta" });

  } catch (err) {
    console.error("Errore unsubscribeFromEvent:", err);
    res.status(500).json({ error: "Errore disiscrizione" });
  }
};



/* ============================================================
   ADMIN → APPROVA EVENTO
============================================================ */
exports.approveEvent = async (req, res) => {
  try {
    const id = req.params.id;

    const event = await Event.findByPk(id);
    if (!event) return res.status(404).json({ error: "Evento non trovato" });

    event.status = "APPROVED";
    await event.save();

    res.json({ message: "Evento approvato" });

  } catch (err) {
    console.error("Errore approveEvent:", err);
    res.status(500).json({ error: "Errore approvazione" });
  }
};



/* ============================================================
   ADMIN → RIFIUTA EVENTO
============================================================ */
exports.rejectEvent = async (req, res) => {
  try {
    const id = req.params.id;

    const event = await Event.findByPk(id);
    if (!event) return res.status(404).json({ error: "Evento non trovato" });

    event.status = "REJECTED";
    await event.save();

    res.json({ message: "Evento rifiutato" });

  } catch (err) {
    console.error("Errore rejectEvent:", err);
    res.status(500).json({ error: "Errore rifiuto" });
  }
};



/* ============================================================
   ADMIN → EVENTI PENDING CON AUTORE
============================================================ */
exports.getPendingEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      where: { status: "PENDING" },
      include: [
        {
          model: User,
          as: "User", 
          attributes: ["username", "email"]
        }
      ],
      order: [["createdAt", "ASC"]]
    });

    res.json(events);

  } catch (err) {
    console.error("Errore getPendingEvents:", err);
    res.status(500).json({ error: "Errore recupero pending" });
  }
};



/* ============================================================
   CHAT: INVIA MESSAGGIO NELL'EVENTO
============================================================ */
exports.sendMessageToEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId  = req.user.id;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Messaggio vuoto" });
    }

    // Controllo iscrizione
    const isMember = await Registration.findOne({
      where: { userId, eventId }
    });

    if (!isMember) {
      return res.status(403).json({ error: "Non sei iscritto a questo evento" });
    }

    // Salvataggio DB
    const saved = await Message.create({
      eventId,
      userId,
      body: message
    });

    const io = req.app.get("io");

   
    const user = await User.findByPk(userId);

    // Socket.io → invia a tutti nella stanza
    io.to(eventId).emit("new-message", {
      eventId,
      userId,
      username: user.username,
      message,
      createdAt: saved.createdAt
    });

    res.json({
      message: "Messaggio inviato",
      saved
    });

  } catch (err) {
    console.error("Errore sendMessageToEvent:", err);
    res.status(500).json({ error: "Errore invio messaggio" });
  }
};


/* ============================================================
   CHAT: OTTIENI TUTTI I MESSAGGI DI UN EVENTO
============================================================ */
exports.getEventMessages = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId  = req.user.id;

    // Controllo iscrizione → obbligatorio
    const isMember = await Registration.findOne({
      where: { userId, eventId }
    });

    if (!isMember) {
      return res.status(403).json({ error: "Non sei iscritto a questo evento" });
    }

    const messages = await Message.findAll({
      where: { eventId },
      include: [
        { model: User, attributes: ["username"] }
      ],
      order: [["createdAt", "ASC"]]
    });

    res.json(messages);

  } catch (err) {
    console.error("Errore getEventMessages:", err);
    res.status(500).json({ error: "Errore nel recupero dei messaggi" });
  }
};



