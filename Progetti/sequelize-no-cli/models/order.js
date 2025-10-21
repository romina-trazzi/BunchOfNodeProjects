module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define("Order", {
    total: { type: DataTypes.FLOAT, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending' },
    UserId: { type: DataTypes.INTEGER, allowNull: false },
  });
  return Order;
};
