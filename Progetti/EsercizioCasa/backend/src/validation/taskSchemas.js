// src/validation/taskSchemas.js
// Schemi di validazione per le Task.
// Campi dal model: 
// - title: STRING(120) obbligatorio alla creazione
// - description: TEXT opzionale
// - completed: BOOLEAN (default false)
// - dueDate: DATE opzionale (accettiamo formato ISO stringa)
// - priority: ENUM('low','medium','high') con default 'medium'

import Joi from 'joi';

// Manteniamo un'unica fonte di verità per i valori ammessi
export const TASK_PRIORITIES = ['low', 'medium', 'high'];

// ID della task (per :id nelle rotte) - coerente con PK numerico auto-increment
export const taskIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
}).label('TaskIdParams');

/**
 * Creazione Task
 * - title obbligatorio, 1..120 (trim per evitare stringhe di soli spazi)
 * - description opzionale, consentiti '' o null
 * - dueDate opzionale, formato ISO (es. '2025-10-21T10:00:00.000Z' o '2025-10-21')
 * - priority opzionale, se non specificata verrà 'medium' lato DB (default del model)
 */
export const createTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(120).required(),
  description: Joi.string().allow('', null),
  completed: Joi.boolean().forbidden(), // in create non lo accettiamo: parte da default false
  dueDate: Joi.date().iso().allow(null),
  priority: Joi.string().valid(...TASK_PRIORITIES)
}).label('CreateTaskBody');

/**
 * Aggiornamento Task (PUT/PATCH)
 * - almeno un campo deve essere presente (min(1))
 * - title/description/dueDate/priority come sopra
 * - completed può essere impostato a true/false
 */
export const updateTaskSchema = Joi.object({
  title: Joi.string().trim().min(1).max(120),
  description: Joi.string().allow('', null),
  completed: Joi.boolean(),
  dueDate: Joi.date().iso().allow(null),
  priority: Joi.string().valid(...TASK_PRIORITIES)
}).min(1).label('UpdateTaskBody');

/**
 * Querystring per LISTA (GET /api/tasks?...)
 * - completed: true/false
 * - priority: low|medium|high
 * - dueFrom/dueTo: filtri data ISO (inclusivi lato controller)
 * - page/limit: paginazione semplice (default suggeriti nel controller)
 */
export const listTasksQuerySchema = Joi.object({
  completed: Joi.boolean(),
  priority: Joi.string().valid(...TASK_PRIORITIES),
  dueFrom: Joi.date().iso(),
  dueTo: Joi.date().iso(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
}).label('ListTasksQuery');