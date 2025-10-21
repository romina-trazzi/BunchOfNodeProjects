const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Product = require("./product")(sequelize, Sequelize);
db.User = require("./user")(sequelize, Sequelize);
db.Order = require("./order")(sequelize, Sequelize);

db.User.hasMany(db.Order, { foreignKey: "UserId" });
db.Order.belongsTo(db.User, { foreignKey: "UserId" });

module.exports = db;
