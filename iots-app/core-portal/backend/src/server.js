const app = require('./app');
const server = app.listen(Number(process.env.PORT || 3001), '127.0.0.1', () => console.log('IOTS API: http://127.0.0.1:' + (process.env.PORT || 3001)));
const io = require('./messaging/socket')(server, app, require('./database/connection'));
module.exports = { app, server, io };
