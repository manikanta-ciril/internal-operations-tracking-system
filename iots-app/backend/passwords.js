const { scryptSync, randomBytes, timingSafeEqual } = require('node:crypto');
exports.hash = (password) => {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
};
exports.verify = (password, stored) => {
  const [salt, key] = stored.split(':');
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(key, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
};
