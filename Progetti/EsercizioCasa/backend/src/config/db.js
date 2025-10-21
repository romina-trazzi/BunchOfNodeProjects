// Centralizza la lettura/env + opzioni comuni.
// Assumi che 'dotenv/config' sia caricato nell'entrypoint (src/index.js).
const bool = (v, def = false) => String(v ?? def).toLowerCase() === 'true';

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: Number(process.env.DB_PORT ?? 3306),
  DB_NAME: process.env.DB_NAME || 'appdb',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASS: process.env.DB_PASS || '',
  DB_SSL: bool(process.env.DB_SSL, false),
  DB_SYNC: bool(process.env.DB_SYNC, false),                // solo dev
  DB_CONNECT_RETRIES: Number(process.env.DB_CONNECT_RETRIES ?? 5),
  DB_CONNECT_BACKOFF_MS: Number(process.env.DB_CONNECT_BACKOFF_MS ?? 2000),
};

export const flags = {
  isProd: env.NODE_ENV === 'production',
  doSync: env.DB_SYNC && (env.NODE_ENV !== 'production'),   // mai in prod
};

export const sequelizeOpts = {
  dialect: 'mysql',
  host: env.DB_HOST,
  port: env.DB_PORT,
  logging: false,                // metti true in dev se vuoi vedere le query
  timezone: '+00:00',            // coerente in UTC
  define: { timestamps: true },  // default per i model
  pool: { max: 10, min: 0, idle: 10000 },
  ...(env.DB_SSL
    ? { dialectOptions: { ssl: { require: true, rejectUnauthorized: false } } }
    : {}),
};