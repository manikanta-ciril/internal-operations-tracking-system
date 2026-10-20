const assert = require('node:assert/strict');
const { loginUsername } = require('../src/auth/login-identity');
assert.equal(loginUsername(' ViJaY '), 'vijay');
assert.equal(loginUsername(' ViJaY@CIRIL.IN '), 'vijay');
assert.equal(loginUsername('vijay@example.com'), '');
assert.equal(loginUsername('vijay@other@ciril.in'), '');
assert.equal(loginUsername('x'.repeat(81)), '');
console.log('PASS: username and company email aliases, foreign domain rejection and length limit.');
