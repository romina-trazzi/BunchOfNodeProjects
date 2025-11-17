module.exports = (req, res, next) => {
  // req.user arriva dal middleware di autenticazione JWT
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      error: "Accesso negato: permessi amministrativi richiesti."
    });
  }

  // Se è admin, può proseguire
  next();
};
