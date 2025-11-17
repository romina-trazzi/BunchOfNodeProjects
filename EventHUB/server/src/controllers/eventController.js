const db = require("../models");
const Event = db.Event;


// Funzione per creare gli eventi
exports.createEvent = async (req, res) => {
  try {
    const userId = req.user.id;

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
      // location_geo: null,  // da implementare
      imageUrl
    });

    return res.status(201).json({
      message: "Evento creato con successo",
      event
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Errore durante la creazione dell’evento" });
  }
};


// Funzione per ottenere l'elenco degli eventi di un utente
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


// Funzione per eliminare un evento creato da un utente
exports.deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id; // preso dal token

    const event = await Event.findByPk(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Evento non trovato' });
    }

    // Solo il proprietario può eliminarlo
    if (event.ownerId !== userId) {
      return res.status(403).json({ error: 'Non autorizzato a eliminare questo evento' });
    }

    await event.destroy();

    return res.json({ message: 'Evento eliminato con successo' });

  } catch (error) {
    console.error('Errore eliminazione evento:', error);
    return res.status(500).json({ error: 'Errore del server' });
  }
};


// Funzione per aggiornare un evento  
exports.updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;

    // Cerca l'evento
    const event = await Event.findByPk(eventId);

    if (!event) {
      return res.status(404).json({ error: "Evento non trovato" });
    }

    // Sicurezza: solo il proprietario può modificare
    if (event.ownerId !== userId) {
      return res.status(403).json({ error: "Non autorizzato a modificare questo evento" });
    }

    // Dati aggiornabili
    const {
      title,
      description,
      startsAt,
      capacity,
      category,
      location,
      imageUrl
    } = req.body;

    // Aggiornamento
    await event.update({
      title: title ?? event.title,
      description: description ?? event.description,
      startsAt: startsAt ?? event.startsAt,
      capacity: capacity ?? event.capacity,
      category: category ?? event.category,
      location: location ?? event.location,
      imageUrl: imageUrl ?? event.imageUrl
    });

    return res.json({
      message: "Evento aggiornato con successo",
      event
    });

  } catch (error) {
    console.error("Errore update evento:", error);
    return res.status(500).json({ error: "Errore del server" });
  }
};