require('dotenv').config({ path: require('node:path').join(require('../config/paths').backend, '.env') });
const mysql = require('mysql2/promise');
module.exports = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'iots_auth_temp',
  connectionLimit: 5,
  multipleStatements: false,
});
