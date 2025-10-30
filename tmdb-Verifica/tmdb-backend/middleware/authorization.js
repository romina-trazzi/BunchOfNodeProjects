import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

// --- VERIFICA JWT ---
export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Token mancante' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token non valido' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) return res.status(404).json({ error: 'Utente non trovato' });

    req.user = user; // aggiunge l'utente alla richiesta
    next();
  } catch (err) {
    console.error('JWT verify error:', err.message);
    return res.status(403).json({ error: 'Token scaduto o non valido' });
  }
};


// --- VERIFICA RUOLO ---
export const requireRole = (role) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Utente non autenticato' });
  if (req.user.role !== role) return res.status(403).json({ error: 'Accesso negato' });
  next();
};
