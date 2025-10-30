// Trasforma errori in risposte JSON coerenti (DB, servizi esterni, JWT, rete, fallback 500)
export function errorHandler(err, req, res, _next) {
  const isProd = process.env.NODE_ENV === 'production';

  let status = err.status || 500;
  let message = err.message || 'Errore interno';
  let details;

  // ==== Errori Sequelize / DB ====
  switch (err.name) {
    case 'SequelizeValidationError':
      status = 400;
      message = 'Validazione DB fallita';
      details = err.errors?.map(e => e.message);
      break;
    case 'SequelizeUniqueConstraintError':
      status = 409;
      message = 'Risorsa già esistente (vincolo di unicità)';
      details = err.errors?.map(e => `${e.path} deve essere unico`);
      break;
    case 'SequelizeForeignKeyConstraintError':
      status = 400;
      message = 'Relazione non valida (vincolo FK fallito)';
      break;
    case 'SequelizeDatabaseError':
      status = 500;
      message = 'Errore del database';
      break;
    default:
      break;
  }

  // ==== JWT ====
  if (err.name === 'JsonWebTokenError') {
    status = 401; message = 'Token non valido';
  }
  if (err.name === 'TokenExpiredError') {
    status = 401; message = 'Token scaduto';
  }

  // ==== Servizi esterni (Axios/Fetch) ====
  if (err.isAxiosError || err.name === 'AxiosError' || err.name === 'FetchError') {
    status = err.response?.status ?? 502;
    message =
      (err.response?.data && (err.response.data.error || err.response.data.message)) ||
      err.message || 'Errore su servizio esterno';
    details = {
      url: err.config?.url,
      method: err.config?.method,
      status: err.response?.status,
    };
  }

  // ==== Errori di rete/DNS ====
  if (['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN'].includes(err.code)) {
    status = 503; message = 'Servizio non raggiungibile';
    details = { code: err.code, host: err.hostname };
  }

  // ==== Errori applicativi esposti (facoltativo) ====
  if (typeof err.expose === 'boolean' && err.expose && err.status && err.message) {
    status = err.status; message = err.message;
  }

  const payload = { error: message };
  if (details) payload.details = details;
  if (!isProd) payload.stack = err.stack;

  if (!isProd) console.error('[ERROR]:', { status, name: err.name, code: err.code, message: err.message });

  res.status(status).json(payload);
}