'use strict';

module.exports = (sequelize, DataTypes) => {
    
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING(180),
      allowNull: false,
      unique: true
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('USER', 'ADMIN'),
      allowNull: false,
      defaultValue: 'USER'
    }
  });

  // Associations between User and other models
  User.associate = (models) => {
    // One User -> Many Events 
    User.hasMany(models.Event, { foreignKey: 'ownerId' });
    // One User -> Many Registrations
    User.hasMany(models.Registration, { foreignKey: 'userId' });
    // One User -> Many Messages 
    User.hasMany(models.Message, { foreignKey: 'userId' });
  };

  return User;
};