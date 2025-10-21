// Modello Product: prodotto con SKU univoco, prezzo, stock >= 0.
// Le categorie sono N:M via tabella ponte ProductCategory.
import { DataTypes } from 'sequelize';
import { sequelize } from '../db/sequelize.js';

const Product = sequelize.define('Product', {
  name: {
    type: DataTypes.STRING(160),
    allowNull: false,
    validate: { len: { args: [2, 160], msg: 'Nome 2-160 caratteri' } }
  },
  sku: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true,
    validate: {
      is: { args: [/^[A-Za-z0-9_-]+$/], msg: 'SKU può contenere lettere, numeri, _ e -' }
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: { msg: 'Prezzo non valido' },
      min(value) { if (Number(value) < 0) throw new Error('Prezzo deve essere >= 0'); }
    }
  },
  stock: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    validate: { min: { args: [0], msg: 'Stock deve essere >= 0' } }
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'products',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['sku'] },
    { fields: ['active'] }
  ]
});

export default Product;