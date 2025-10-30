// Gestisce avvio/chiusura connessione con retry e (opzionale) sync in dev.
import { sequelize } from './sequelize.js';
import { env, flags } from './config.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export async function initDB() {
  let attempt = 0;
  while (attempt < env.DB_CONNECT_RETRIES) {
    try {
      attempt++;
      await sequelize.authenticate();
      console.log('✅ DB connesso');

      if (flags.doSync) {
        await sequelize.sync({ alter: true });
        console.log('Modelli sincronizzati (alter=true)');
      }
      return;
    } catch (err) {
      console.error(`❌ Connessione DB fallita (tentativo ${attempt}/${env.DB_CONNECT_RETRIES}):`, err?.message || err);
      if (attempt >= env.DB_CONNECT_RETRIES) throw err;
      await wait(env.DB_CONNECT_BACKOFF_MS);
    }
  }
}

export async function closeDB() {
  await sequelize.close();
  console.log('👋 Connessione DB chiusa');
}