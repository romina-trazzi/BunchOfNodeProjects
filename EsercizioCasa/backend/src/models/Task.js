// Modello Task: appartiene a un User (FK userId).
// Campi tipici: titolo, descrizione, completed, dueDate, priority.
import { DataTypes } from 'sequelize';
import { sequelize } from '../db/sequelize.js';

const Task = sequelize.define('Task', {
  title: {
    type: DataTypes.STRING(120),
    allowNull: false,
    validate: { len: { args: [1, 120], msg: 'Titolo obbligatorio (max 120)' } }
  },
  description: {
    type: DataTypes.TEXT, // opzionale
    allowNull: true
  },
  completed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  dueDate: {
    type: DataTypes.DATE, // opzionale: scadenza
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    allowNull: false,
    defaultValue: 'medium'
  }
  // userId verrà aggiunto dall'associazione
}, {
  tableName: 'tasks',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['completed'] }
  ]
});

export default Task;