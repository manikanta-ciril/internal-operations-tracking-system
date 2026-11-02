module.exports = new Set([
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  ...(process.env.IOTS_ALLOWED_ORIGINS || '').split(',').map(origin => origin.trim()).filter(Boolean),
]);
