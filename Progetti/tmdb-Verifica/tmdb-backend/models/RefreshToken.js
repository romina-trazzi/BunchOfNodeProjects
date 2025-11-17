import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { User } from './User.js';

export const RefreshToken = sequelize.define(
  'RefreshToken',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    revoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE' // se un utente viene eliminato, i token vengono rimossi
    }
  },
  {
    tableName: 'refresh_tokens',
    timestamps: true
  }
);

// --- RELAZIONI ---
RefreshToken.belongsTo(User, { foreignKey: 'userId' }); 
User.hasMany(RefreshToken, { foreignKey: 'userId' }); 
