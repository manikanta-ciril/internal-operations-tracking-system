const express = require('express');
const app = express();
app.disable('x-powered-by');
const authJson = express.json({ limit: '8kb' });
const taskJson = express.json({ limit: '512kb' });
app.use((req, res, next) => (/^\/api\/auth\/tasks(?:\/|$)/.test(req.path) ? taskJson : authJson)(req, res, next));
app.use(require('./auth/routes'));
app.use((error, req, res, next) => {
  if (!error.status || error.status >= 500) console.error('API error:', error.code || error.message);
  if (error.type === 'entity.too.large') return res.status(413).json({ message: req.path.startsWith('/api/auth/tasks') ? 'This work request is too large. Reduce the attachment or report size and retry.' : 'Photo is too large. Retake it and try again.' });
  if (error.status === 404) return res.status(404).json({ message: 'Photo file not found.' });
  const status = [400, 401, 403, 409, 429].includes(error.status) ? error.status : 503;
  res.status(status).json({ message: status !== 503 ? error.message : 'Server is unreachable' });
});
module.exports = app;
