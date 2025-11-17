const db = require("../models");
const Event = db.Event;
const Registration = db.Registration;
const { Op } = db.Sequelize;

// ============================================================
// CREA EVENTO + iscrizione automatica dell'organizzatore
// ============================================================
exports.createEvent = async (req, res) => {
  try {
    // ID dell'utente preso dal token JWT
    const userId = req.user.id;

    // Se admin → evento approvato immediatamente
    const status = req.user.role === "ADMIN" ? "APPROVED" : "PENDING";

    const {
      title,
      description,
      startsAt,
      capacity,
      category,
      location,
      imageUrl,
    } = req.body;

    // Creazione evento
    const event = await Event.create({
      ownerId: userId,
      title,
      description,
      startsAt,
      capacity,
      category,
      location,
      imageUrl,
      status   // <<< AGGIUNTO QUI
    });

    // Organizzatore iscritto automaticamente
    await Registration.create({
      userId: userId,
      eventId: event.id,
    });

    return res.status(201).json({
      message: "Evento creato con successo",
      event
    });

  } catch (error) {
    console.error("Errore createEvent:", error);
    res.status(500).json({ error: "Errore durante la creazione dell’evento" });
  }
};

// ============================================================
// RECUPERA EVENTI CREATI DALL'UTENTE
// ============================================================
exports.getMyEvents = async (req, res) => {
  try {
    const userId = req.user.id;

    const events = await Event.findAll({
      where: { ownerId: userId },
      order: [["startsAt", "ASC"]],
    });

    return res.json(events);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore durante il recupero degli eventi" });
  }
};

// ============================================================
// ELIMINA EVENTO
// ============================================================
exports.deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    const event = await Event.findByPk(eventId);

    if (!event) return res.status(404).json({ error: "Evento non trovato" });
    if (event.ownerId !== userId)
      return res.status(403).json({ error: "Non autorizzato a eliminare questo evento" });

    // elimina anche tutte le iscrizioni
    await Registration.destroy({ where: { eventId } });

    await event.destroy();

    return res.json({ message: "Evento eliminato con successo" });

  } catch (error) {
    console.error("Errore eliminazione evento:", error);
    return res.status(500).json({ error: "Errore del server" });
  }
};

// ============================================================
// UPDATE EVENTO
// ============================================================
exports.updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    const event = await Event.findByPk(eventId);
    if (!event) return res.status(404).json({ error: "Evento non trovato" });
    if (event.ownerId !== userId)
      return res.status(403).json({ error: "Non autorizzato a modificare" });

    const {
      title,
      description,
      startsAt,
      capacity,
      category,
      location,
      imageUrl
    } = req.body;

    await event.update({
      title: title ?? event.title,
      description: description ?? event.description,
      startsAt: startsAt ?? event.startsAt,
      capacity: capacity ?? event.capacity,
      category: category ?? event.category,
      location: location ?? event.location,
      imageUrl: imageUrl ?? event.imageUrl
    });

    return res.json({ message: "Evento aggiornato con successo", event });

  } catch (error) {
    console.error("Errore update evento:", error);
    return res.status(500).json({ error: "Errore del server" });
  }
};

// ============================================================
// CATALOGO EVENTI (con filtri ufficiali)
// ============================================================
exports.getAllEvents = async (req, res) => {
  try {
    const { title, month, category, location } = req.query;

    const where = {};

    where.status = "APPROVED";

    if (title) where.title = { [Op.iLike]: `%${title}%` };

    if (month) {
      where.startsAt = db.Sequelize.where(
        db.Sequelize.fn("to_char", db.Sequelize.col("startsAt"), "MM"),
        month
      );
    }

    if (category) where.category = category;
    if (location) where.location = { [Op.iLike]: `%${location}%` };

    const events = await Event.findAll({
      where,
      order: [["startsAt", "ASC"]],
    });

    res.json(events);

  } catch (err) {
    console.error("Errore getAllEvents:", err);
    res.status(500).json({ error: "Errore nel recupero degli eventi" });
  }
};

// ============================================================
// EVENTI A CUI L’UTENTE È ISCRITTO
// ============================================================
exports.getSubscribedEvents = async (req, res) => {
  try {
    const userId = req.user.id;

    const registrations = await Registration.findAll({
      where: { userId },
      include: [{ model: Event }]
    });

    const events = registrations.map(r => r.Event);

    res.json(events);

  } catch (err) {
    console.error("Errore getSubscribedEvents:", err);
    res.status(500).json({ error: "Errore nel recupero delle iscrizioni" });
  }
};

// ============================================================
// ISCRIZIONE EVENTO
// ============================================================
exports.subscribeToEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    const event = await Event.findByPk(eventId);
    if (!event) return res.status(404).json({ error: "Evento non trovato" });

    const exists = await Registration.findOne({
      where: { userId, eventId }
    });
    if (exists) return res.status(400).json({ error: "Sei già iscritto" });

    // controllo capienza
    const count = await Registration.count({ where: { eventId } });
    if (count >= event.capacity)
      return res.status(400).json({ error: "Capienza massima raggiunta" });

    await Registration.create({ userId, eventId });

    res.json({ message: "Iscrizione effettuata" });

  } catch (err) {
    console.error("Errore subscribe:", err);
    res.status(500).json({ error: "Errore del server" });
  }
};

// ============================================================
// DISISCRIZIONE EVENTO 
// ============================================================
exports.unsubscribeFromEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    const registration = await Registration.findOne({
      where: { userId, eventId }
    });

    if (!registration) {
      return res.status(400).json({ error: "Non risulti iscritto" });
    }

    await registration.destroy();

    res.json({ message: "Disiscrizione effettuata" });

  } catch (err) {
    console.error("Errore unsubscribe:", err);
    res.status(500).json({ error: "Errore del server" });
  }
};

// ============================================================
// ADMIN AREA
// ============================================================

// Approva evento
exports.approveEvent = async (req, res) => {
  try {
    const id = req.params.id;
    const event = await Event.findByPk(id);

    if (!event) {
      return res.status(404).json({ error: "Evento non trovato" });
    }

    event.status = "APPROVED";
    await event.save();

    res.json({ message: "Evento approvato con successo", event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Rifiuta evento
exports.rejectEvent = async (req, res) => {
  try {
    const id = req.params.id;
    const event = await Event.findByPk(id);

    if (!event) {
      return res.status(404).json({ error: "Evento non trovato" });
    }

    event.status = "REJECTED";
    await event.save();

    res.json({ message: "Evento rifiutato", event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lista eventi PENDING 
exports.getPendingEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      where: { status: "PENDING" },
      order: [["createdAt", "ASC"]]
    });

    res.json(events);

  } catch (err) {
    console.error("Errore getPendingEvents:", err);
    res.status(500).json({ error: "Errore nel recupero degli eventi in attesa" });
  }
};