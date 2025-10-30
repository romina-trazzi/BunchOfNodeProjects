// src/validation/authSchemas.js
// Importa Joi: libreria per definire "schemi" di validazione dichiarativi.
import Joi from 'joi';

/**
 * Schema di validazione per la REGISTRAZIONE.
 * - Normalizza name/email (trim); impone lunghezze min/max sensate.
 * - Non accetta "role" dal client: lo settiamo noi lato server (default 'user').
 * - La password è minima 8 caratteri (junior-friendly); puoi alzare i requisiti più avanti.
 */
export const registerSchema = Joi.object({
  // Nome: minimo 2, massimo 80, rimuove spazi agli estremi.
  name: Joi.string()
    .trim()
    .min(2)
    .max(80)
    .required(),

  // Email: valida che sia un'email, normalizza in minuscolo e rimuove spazi.
  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .max(120)
    .required(),

  // Password: almeno 8 caratteri. (In futuro puoi imporre complessità con pattern).
  password: Joi.string()
    .min(8)
    .max(128)
    .required(),

  // NOTA: niente "role" qui. Se il client lo inviasse, verrà rimosso da stripUnknown nel middleware.
}).messages({
  // Messaggi personalizzati (opzionali, più chiari in italiano)
  'string.base': '{#label} deve essere una stringa',
  'string.empty': '{#label} non può essere vuoto',
  'string.min': '{#label} deve avere almeno {#limit} caratteri',
  'string.max': '{#label} deve avere al massimo {#limit} caratteri',
  'string.email': 'Email non valida',
  'any.required': '{#label} è obbligatorio'
}).label('RegisterBody');

/**
 * Schema di validazione per il LOGIN.
 * - Email e password obbligatorie.
 * - Anche qui normalizziamo l'email (trim + lowercase).
 */
export const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required(),

  password: Joi.string()
    .required()
}).messages({
  'string.email': 'Email non valida',
  'any.required': '{#label} è obbligatorio'
}).label('LoginBody');