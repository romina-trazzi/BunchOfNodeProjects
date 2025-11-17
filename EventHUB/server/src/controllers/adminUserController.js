const { User } = require("../models");

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

    user.isBlocked = true;
    await user.save();
    res.json({ message: "Utente bloccato", user: { id: user.id, isBlocked: user.isBlocked } });
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

    user.isBlocked = false;
    await user.save();
    res.json({ message: "Utente sbloccato", user: { id: user.id, isBlocked: user.isBlocked } });
  } catch (err) {
    console.error("Errore unblockUser:", err);
    res.status(500).json({ error: "Errore nello sblocco utente" });
  }
};