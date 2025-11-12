'use strict';

module.exports = (sequelize, DataTypes) => {
  const Registration = sequelize.define('Registration', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    eventId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    }
  });

  Registration.associate = (models) => {
    // One Registration -> One User
    Registration.belongsTo(models.User, { foreignKey: 'userId' });
    // One Registration -> One Event
    Registration.belongsTo(models.Event, { foreignKey: 'eventId' });
  };

  return Registration;
};
