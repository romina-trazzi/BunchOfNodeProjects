const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2');

const sequelize = new Sequelize('test', 'root', 'trazzi', {
  host: 'localhost',
  port: 3306,
  dialect: 'mysql',
  dialectModule: mysql2,      
  logging: false,
  pool: { max: 10, min: 0, idle: 10000 },
});

const db = {}

db.Sequelize = Sequelize;
db.sequelize = sequelize; 

module.exports = db;



