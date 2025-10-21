const db = require("../models");

exports.getUserOrders = async (req, res) => {
  const user = await db.User.findByPk(req.params.id, {
    include: db.Order,
  });
  if (!user) return res.status(404).json({ message: "Utente non trovato" });
  res.json(user);
};
