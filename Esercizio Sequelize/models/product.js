import { DataTypes } from "sequelize";
import 



module.exports = () => (
const Product = db.sequelize.define("Product", {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.INTEGER,
    unique: true,
    allowNull: false
  },
  stock : {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});
);