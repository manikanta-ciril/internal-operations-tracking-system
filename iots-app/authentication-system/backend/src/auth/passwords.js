const { scrypt, scryptSync, randomBytes, timingSafeEqual } = require('node:crypto');
exports.hash = (password) => {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
};
const dummy = exports.hash(randomBytes(32).toString('hex'));
let active = 0;
const waiting = [];
exports.verify = async (password, stored = dummy) => {
  if (active >= 4) {
    if (waiting.length >= 32) throw Object.assign(new Error('Sign-in is busy. Please try again shortly.'), { status: 429 });
    await new Promise(resolve => waiting.push(resolve));
  } else active++;
  try {
  const [salt, key] = stored.split(':');
  const actual = await new Promise((resolve, reject) => scrypt(password, salt, 64, (error, result) => error ? reject(error) : resolve(result)));
  const expected = Buffer.from(key, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
  } finally {
    if (waiting.length) waiting.shift()();
    else active--;
  }
};
