// src/middleware/validate.js
// Uso tipico nelle routes:
//   import { validate } from '../middleware/validate.js';
//   router.post('/', validate(createTaskSchema), createTask);
//   router.put('/:id', validate(taskIdParamSchema, 'params'), validate(updateTaskSchema), updateTask);
//   router.get('/', validate(listTasksQuerySchema, 'query'), listTasks);

export const validate = (schema, where = 'body', opts = {}) => {
  // Opzioni "sane" di default:
  // - abortEarly:false  => raccoglie TUTTI gli errori insieme
  // - stripUnknown:true => rimuove i campi non previsti dallo schema
  // - convert:true      => converte tipi quando possibile (es. "true" -> true in query)
  const options = {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
    ...opts,
  };

  // Middleware vero e proprio
  return (req, res, next) => {
    // Se chiedi di validare una sezione inesistente, evita crash e vai oltre
    if (!req[where]) req[where] = {};

    const { value, error } = schema.validate(req[where], options);

    if (error) {
      // Normalizziamo i messaggi per il client
      const details = error.details?.map(d => d.message) ?? ['Payload non valido'];

      // Esempi di status code diversi? In genere 400 è corretto per validazione input.
      return res.status(400).json({
        error: 'Validazione fallita',
        details
      });
    }

    // Sovrascrivi con la versione "pulita" (campi extra rimossi, tipi convertiti)
    req[where] = value;
    next();
  };
};

// (Opzionale) helper rapidi, se ti piace lo stile più verboso:
// export const validateBody   = (schema, opts) => validate(schema, 'body', opts);
// export const validateQuery  = (schema, opts) => validate(schema, 'query', opts);
// export const validateParams = (schema, opts) => validate(schema, 'params', opts);