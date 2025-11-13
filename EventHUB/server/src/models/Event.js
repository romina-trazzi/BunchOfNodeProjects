module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define('Event', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    startsAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    seatsTaken: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    category: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      allowNull: false,
      defaultValue: 'PENDING'
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    location_geo: {
      type: DataTypes.GEOGRAPHY('POINT', 4326),
      allowNull: true
    },
    location: { 
      type: DataTypes.STRING(500),
      allowNull: true
    }
  });

  // Associations between Event and other models
  Event.associate = (models) => {
    // One Event -> One User (owner)
    Event.belongsTo(models.User, { foreignKey: 'ownerId' });
    // One Event -> Many Registrations
    Event.hasMany(models.Registration, { foreignKey: 'eventId' });
    // One Event -> Many Messages
    Event.hasMany(models.Message, { foreignKey: 'eventId' });
  };

  return Event;
};