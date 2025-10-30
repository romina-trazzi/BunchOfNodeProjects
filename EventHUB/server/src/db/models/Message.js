'use strict';

module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
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
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  });

  Message.associate = (models) => {
    // One Message -> One User
    Message.belongsTo(models.User, { foreignKey: 'userId' });
    // One Message -> One Event
    Message.belongsTo(models.Event, { foreignKey: 'eventId' });
  };

  return Message;
};