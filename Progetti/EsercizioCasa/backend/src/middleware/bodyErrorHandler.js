// Cattura errori del body parser (JSON malformato, payload eccessivo)
export function jsonErrorGuard(err, _req, res, next) {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'JSON non valido (syntax error).' });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Payload troppo grande.' });
  }
  next(err);
}