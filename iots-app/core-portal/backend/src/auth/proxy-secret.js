const fs = require('node:fs');
const path = require('node:path');
const { randomBytes } = require('node:crypto');
let secret = process.env.IOTS_PROXY_SECRET;
if (!secret) {
  if (process.env.NODE_ENV === 'production') throw new Error('Set IOTS_PROXY_SECRET for the trusted API proxy.');
  const filename = path.join(require('../config/paths').local, 'iots-proxy.key');
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  try { fs.writeFileSync(filename, randomBytes(32).toString('hex'), { flag: 'wx', mode: 0o600 }); }
  catch (error) { if (error.code !== 'EEXIST') throw error; }
  secret = fs.readFileSync(filename, 'utf8').trim();
}
module.exports = secret;
