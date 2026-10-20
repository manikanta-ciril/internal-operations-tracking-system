const { isIP } = require('node:net');
const { timingSafeEqual } = require('node:crypto');
const proxySecret = require('./proxy-secret');

function clientAddress(req) {
  const secret = proxySecret;
  const token = req.headers['x-iots-proxy-token'];
  const address = req.headers['x-iots-client-ip'];
  const local = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
  if (local && secret && typeof token === 'string' && Buffer.byteLength(token) === Buffer.byteLength(secret) && timingSafeEqual(Buffer.from(token), Buffer.from(secret)) && typeof address === 'string' && isIP(address)) return address;
  return req.socket.remoteAddress;
}

function createLoginLimiter(now = Date.now) {
  const accounts = new Map();
  const clients = new Map();
  function bucket(map, key) {
    const time = now();
    for (const [name, value] of map) if (value.until <= time) map.delete(name);
    if (!map.has(key)) map.set(key, { count: 0, until: time + 60000 });
    return map.get(key);
  }
  return {
    consume(address, account) {
      const client = bucket(clients, address);
      if (client.count >= 100) return null;
      client.count++;
      const employee = bucket(accounts, account || '<invalid>');
      if (employee.count >= 10) return null;
      employee.count++;
      return success => { if (success && accounts.get(account) === employee) accounts.delete(account); };
    },
  };
}
module.exports = { clientAddress, createLoginLimiter };
