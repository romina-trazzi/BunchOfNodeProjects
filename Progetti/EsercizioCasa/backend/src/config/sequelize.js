// Crea ed esporta l'istanza condivisa di Sequelize.
import { Sequelize } from 'sequelize';
import { env, sequelizeOpts } from './config.js';

export const sequelize = new Sequelize(
  env.DB_NAME,
  env.DB_USER,
  env.DB_PASS,
  sequelizeOpts
);