// Tabella ponte per N:M Product <-> Category
// Chiave composita (productId, categoryId) unica.
import { DataTypes } from 'sequelize';
import { sequelize } from '../db/sequelize.js';

const ProductCategory = sequelize.define('ProductCategory', {
  // Sequelize aggiungerà automaticamente productId e categoryId
}, {
  tableName: 'product_categories',
  timestamps: false,
  indexes: [
    { unique: true, fields: ['productId', 'categoryId'] },
    { fields: ['categoryId'] }
  ]
});

export default ProductCategory;