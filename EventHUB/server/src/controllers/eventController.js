const db = require("../models");
const Event = db.Event;

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