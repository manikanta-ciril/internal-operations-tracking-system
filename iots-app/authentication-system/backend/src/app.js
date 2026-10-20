const express = require('express');
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '8kb' }));
app.use(require('./auth/routes'));
app.use((error, req, res, next) => {
  if (!error.status || error.status >= 500) console.error('API error:', error.code || error.message);
  if (error.type === 'entity.too.large') return res.status(413).json({ message: 'Photo is too large. Retake it and try again.' });
  if (error.status === 404) return res.status(404).json({ message: 'Photo file not found.' });
  const status = [400, 401, 403, 409, 429].includes(error.status) ? error.status : 503;
  res.status(status).json({ message: status !== 503 ? error.message : 'Server is unreachable' });
});
module.exports = app;
