import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { User } from "./User.js";

export const Task = sequelize.define("Task", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.TEXT },
  status: {
    type: DataTypes.ENUM("todo", "inprogress", "done"),
    defaultValue: "todo"
  }
});

User.hasMany(Task, { foreignKey: "userId", onDelete: "CASCADE" });
Task.belongsTo(User, { foreignKey: "userId" });