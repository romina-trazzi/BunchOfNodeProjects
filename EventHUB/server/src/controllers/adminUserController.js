// controllers/adminUserController.js

const { User } = require('../models'); 

exports.listUsers = async (_req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "username", "email", "role", "isBlocked"],
      order: [["role", "DESC"], ["username", "ASC"]]
    });
    res.json(users);
  } catch (err) {
    console.error("Errore listUsers:", err);
    res.status(500).json({ error: "Errore nel recupero utenti" });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "Utente non trovato" });

    // Non permettere di bloccare un amministratore
    if (user.role === 'ADMIN') {
      return res.status(400).json({ error: "Non puoi bloccare un amministratore" });
    }

    user.isBlocked = true;
    await user.save();

    console.log(`Blocco utente: ${user.id} - Nuovo stato isBlocked: ${user.isBlocked}`);
    
    res.json({
      message: "Utente bloccato",
      user: { id: user.id, isBlocked: user.isBlocked }
    });
  } catch (err) {
    console.error("Errore blockUser:", err);
    res.status(500).json({ error: "Errore nel blocco utente" });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "Utente non trovato" });

    // Log per diagnosticare il valore prima del salvataggio
    console.log(`Sblocco utente: ${user.id} - Stato isBlocked prima: ${user.isBlocked}`);

    // Cambia lo stato di `isBlocked` a false
    user.isBlocked = false;

    // Forza l'aggiornamento con User.update()
    await User.update({ isBlocked: false }, { where: { id: user.id } });

    // Log per diagnosticare il valore dopo il salvataggio
    console.log(`Sblocco utente: ${user.id} - Stato isBlocked dopo: ${user.isBlocked}`);

    res.json({
      message: "Utente sbloccato",
      user: { id: user.id, isBlocked: false }
    });
  } catch (err) {
    console.error("Errore unblockUser:", err);
    res.status(500).json({ error: "Errore nello sblocco utente" });
  }
};