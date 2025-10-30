import { Strategy as LocalStrategy } from 'passport-local';
import { User } from '../models/User.js';
import bcrypt from 'bcrypt';

// Strategia locale: login con username e password
export const localStrategy = new LocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'password'
  },
  async (username, password, done) => {
    try {
      const user = await User.findOne({ where: { username } });
      if (!user) {
        return done(null, false, { statusCode: 401, message: 'Utente non trovato' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { statusCode: 401, message: 'Password errata' });
      }

      return done(null, user); // login riuscito
    } catch (err) {
      return done(err);
    }
  }
);
