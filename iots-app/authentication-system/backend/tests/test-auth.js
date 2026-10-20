// Run against the local dev stack: node test-auth.js
const assert = require('node:assert/strict');
const sharp = require('sharp');
if (!process.env.IOTS_TEST_BASE_URL || !process.env.DB_NAME?.endsWith('_test')) throw new Error('Run npm run test:auth from backend to use the isolated database.');
const base = process.env.IOTS_TEST_BASE_URL;
const checks = new Map();
async function call(route, body, cookie) {
  if (route.endsWith('/confirm') && body && !body.checkId) body = { ...body, checkId: checks.get(cookie)?.checkId };
  const res = await fetch(base + route, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(cookie ? { Cookie: cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json();
  const nextCookie = res.headers.get('set-cookie')?.split(';')[0];
  if (data.location) checks.set(nextCookie || cookie, data.location);
  return { status: res.status, data, cookie: nextCookie, headers: res.headers };
}
async function main() {
  const photoBuffer = await sharp({ create: { width: 320, height: 240, channels: 3, background: '#c09860' } }).jpeg().toBuffer();
  async function photo(cookie, buffer = photoBuffer) {
    const response = await fetch(base + 'photo', { method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'image/jpeg', 'X-Captured-At': String(Date.now()), 'X-Location-Check': checks.get(cookie)?.checkId || '' }, body: buffer });
    return { status: response.status, data: await response.json() };
  }
  const position = () => ({ latitude: require('../src/location/office-location.json').latitude, longitude: require('../src/location/office-location.json').longitude, accuracy: 100, timestamp: Date.now() });
  assert.equal((await call('me')).status, 401);
  assert.equal((await call('login', { username: 'vijay', password: 'wrong' })).status, 401);
  assert.equal((await call('login', { username: "' OR 1=1 --", password: 'wrong' })).status, 401);
  const expected = { vijay: 'chairman', ipsheeta: 'general-manager', manasa: 'lead-manager', bhavani: 'business-development-executive', harshitha: 'creative-communication-executive', deepthi: 'creative-communication-associate', kanna: 'it-system-analyst', manikanta: 'it-system-analyst', superadmin: 'super-admin', admin: 'admin' };
  for (const [username, role] of Object.entries(expected)) {
    const login = await call('login', { username: username === 'vijay' ? username : username + '@ciril.in', password: 'Iots@123' });
    assert.equal(login.status, 200, username);
    assert.equal(login.data.requiresLocationCheck, true);
    assert.ok(!JSON.stringify(login.data).includes('password_hash'));
    assert.match(login.headers.get('set-cookie'), /HttpOnly/);
    assert.match(login.headers.get('set-cookie'), /SameSite=Strict/);
    assert.equal((await call('me', undefined, login.cookie)).status, 403);
    assert.equal((await call('role', { role: 'admin' }, login.cookie)).status, 403);
    assert.equal((await call('location/confirm', { proceed: true }, login.cookie)).status, 409);
    assert.equal((await call('location', { position: null }, login.cookie)).status, 400);
    assert.equal((await photo(login.cookie)).status, 409);
    const check = await call('location', { position: position(), status: 'onsite' }, login.cookie);
    assert.equal(check.data.requiresConfirmation, true);
    assert.equal(check.data.location.status, 'unknown');
    assert.equal((await call('me', undefined, login.cookie)).status, 403);
    assert.equal((await call('location/confirm', { proceed: 'yes' }, login.cookie)).status, 400);
    const confirmed = await call('location/confirm', { proceed: true }, login.cookie);
    assert.equal(confirmed.data.requiresPhoto, true);
    assert.equal((await call('me', undefined, login.cookie)).status, 403);
    assert.equal((await photo(login.cookie, Buffer.from('not a JPEG'))).status, 400);
    const uploaded = await photo(login.cookie);
    assert.equal(uploaded.status, 200);
    assert.equal(uploaded.data.user.activeRole, role);
    assert.equal((await photo(login.cookie)).status, 409);
    assert.equal((await fetch(base + 'photos/' + uploaded.data.photoId, { headers: { Cookie: login.cookie } })).status, 200);
    assert.equal((await fetch(base + 'photos/' + uploaded.data.photoId)).status, 401);
    assert.equal((await call('location/confirm', { proceed: true }, login.cookie)).status, 409);
    const restored = await call('me', undefined, login.cookie);
    assert.equal(restored.data.user.username, username);
    if (username === 'ipsheeta') {
      assert.equal(restored.data.user.roles.length, 3);
      for (const assigned of ['senior-manager', 'executive', 'general-manager']) {
        const switched = await call('role', { role: assigned }, login.cookie);
        assert.equal(switched.status, 200);
        assert.equal((await call('me', undefined, login.cookie)).data.user.activeRole, assigned);
      }
    }
    assert.equal((await call('role', { role: role === 'admin' ? 'chairman' : 'admin' }, login.cookie)).status, 403);
    assert.equal((await call('logout', {}, login.cookie)).status, 409);
    assert.equal((await call('checkout/location', { position: { ...position(), accuracy: 1 } }, login.cookie)).data.requiresPhoto, true);
    const checkout = await fetch(base + 'checkout/photo', { method: 'POST', headers: { Cookie: login.cookie, 'Content-Type': 'image/jpeg', 'X-Captured-At': String(Date.now()), 'X-Location-Check': checks.get(login.cookie)?.checkId || '' }, body: photoBuffer });
    assert.equal(checkout.status, 200);
    assert.equal((await call('me', undefined, login.cookie)).status, 401);
  }
  assert.equal((await call('me', undefined, 'iots_session=forged')).status, 401);
  const cancelled = await call('login', { username: 'vijay', password: 'Iots@123' });
  await call('location', { position: position() }, cancelled.cookie);
  assert.equal((await call('location/confirm', { proceed: false }, cancelled.cookie)).status, 200);
  assert.equal((await call('me', undefined, cancelled.cookie)).status, 401);
  assert.equal((await call('location/confirm', { proceed: true }, cancelled.cookie)).status, 401);
  for (let i = 0; i < 10; i++) await call('login', { username: 'invalid', password: 'wrong' });
  assert.equal((await call('login', { username: 'invalid', password: 'wrong' })).status, 429);
  console.log('PASS: 10 accounts, 11 roles, required location, photo stage gate, invalid JPEG, private photo access, replay protection, session restore, role scope, logout, credentials, cancellation and rate limiting.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
