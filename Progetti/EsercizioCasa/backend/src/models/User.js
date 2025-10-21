// Modello User: profilo base, email univoca, password hash salvata,
// ruolo (user|admin). Escludiamo passwordHash nello scope di default.
import { DataTypes } from 'sequelize';
import { sequelize } from '../db/sequelize.js';

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING(80),
    allowNull: false,
    validate: { len: { args: [2, 80], msg: 'Il nome deve avere 2-80 caratteri' } }
  },
  email: {
    type: DataTypes.STRING(120),
    allowNull: false,
    unique: true,
    validate: { isEmail: { msg: 'Email non valida' } }
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    allowNull: false,
    defaultValue: 'user'
  }
}, {
  tableName: 'users',
  timestamps: true,
  defaultScope: {
    attributes: { exclude: ['passwordHash'] } // nasconde per default
  },
  scopes: {
    withSecret: { attributes: { include: ['passwordHash'] } } // quando serve (login)
  },
  indexes: [
    { unique: true, fields: ['email'] }
  ]
});

/* Helper opzionale: conversione “safe”
È un metodo d’istanza che aggiungiamo al modello User per ottenere 
una versione “sicura” dell’utente da restituire al frontend, 
senza campi sensibili (es. passwordHash).

1. this.get({ plain: true }) prende l’oggetto “puro” dell’istanza Sequelize.
2. Con la destrutturazione estraiamo solo i campi che vogliamo esporre (whitelist).
3. Restituiamo un oggetto con quei campi → nessuna chance di far “scappare” passwordHash o futuri campi sensibili. 

*/

User.prototype.toSafe = function () {
  const { id, name, email, role, createdAt, updatedAt } = this.get({ plain: true });
  return { id, name, email, role, createdAt, updatedAt };
};

export default User;