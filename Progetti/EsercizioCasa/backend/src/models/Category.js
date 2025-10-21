// Modello Category: categorie di prodotto (nome univoco, opzionale descrizione).
import { DataTypes } from 'sequelize';
import { sequelize } from '../db/sequelize.js';

const Category = sequelize.define('Category', {
  name: {
    type: DataTypes.STRING(80),
    allowNull: false,
    unique: true,
    validate: { len: { args: [2, 80], msg: 'Nome categoria 2-80' } }
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'categories',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['name'] }
  ]
});

export default Category;