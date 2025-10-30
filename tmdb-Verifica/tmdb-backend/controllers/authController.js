import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwtHelper.js';
import { Op } from 'sequelize';

// --- LOGIN ---
export const loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username e password richiesti' });

    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(401).json({ error: 'Username o password non validi' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Username o password non validi' });

    const accessToken = generateAccessToken(user);
    const refreshTokenValue = generateRefreshToken(user);

    await RefreshToken.create({
      token: refreshTokenValue,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 giorni
    });

    res.status(200).json({
      message: 'Login riuscito',
      accessToken,
      refreshToken: refreshTokenValue,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (error) {
    next(error);
  }
};

// --- REGISTRAZIONE ---
export const registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'Tutti i campi sono richiesti' });

    const existingUser = await User.findOne({ where: { [Op.or]: [{ username }, { email }] } });
    if (existingUser) {
      return res.status(400).json({
        error: existingUser.username === username ? 'Username già esistente' : 'Email già registrata'
      });
    }

    // Hash automatico grazie agli hook di User
    const newUser = await User.create({ username, email, password, role: 'user' });

    res.status(201).json({
      message: 'Utente registrato con successo',
      user: { id: newUser.id, username: newUser.username }
    });
  } catch (error) {
    next(error);
  }
};

// --- LOGOUT ---
export const logoutUser = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token richiesto per il logout' });

    await RefreshToken.update({ revoked: true }, { where: { token: refreshToken } });

    res.status(200).json({ message: 'Logout effettuato con successo' });
  } catch (error) {
    next(error);
  }
};

// --- REFRESH TOKEN ---
export const refreshUserToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token mancante' });

    const tokenEntry = await RefreshToken.findOne({ where: { token: refreshToken, revoked: false } });
    if (!tokenEntry) return res.status(403).json({ error: 'Refresh token non valido' });

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(403).json({ error: 'Refresh token scaduto o non valido' });
    }

    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(404).json({ error: 'Utente non trovato' });

    const newAccessToken = generateAccessToken(user);
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    next(error);
  }
};

// --- PROFILO UTENTE ---
// Assunto che verifyToken middleware imposti req.user
export const getUserProfile = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Utente non autenticato' });

    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    next(error);
  }
};
