const assert = require('node:assert/strict');
const sharp = require('sharp');
const pool = require('../src/database/connection');
const office = require('../src/location/office-location.json');
if (!process.env.IOTS_TEST_BASE_URL || !process.env.DB_NAME?.endsWith('_test')) throw Error('Isolated test database required.');
const base = process.env.IOTS_TEST_BASE_URL;
async function call(route, body, cookie) {
  const response = await fetch(base + route, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: response.status, data: await response.json(), cookie: response.headers.get('set-cookie')?.split(';')[0] };
}
async function main() {
  const login = async () => (await call('login', { username: 'deepthi', password: 'Iots@123' })).cookie;
  const check = cookie => call('location', { position: { latitude: office.latitude + .01, longitude: office.longitude, timestamp: Date.now() } }, cookie);
  let cookie = await login();
  let result = await check(cookie);
  assert.equal(result.data.requiresConfirmation, true);
  assert.equal(result.data.location.status, 'offsite');
  assert.equal((await call('me', undefined, cookie)).status, 403);
  assert.equal((await call('location/confirm', { proceed: true, checkId: 'forged' }, cookie)).status, 409);
  assert.equal((await call('location/confirm', { proceed: false, checkId: result.data.location.checkId }, cookie)).data.cancelled, true);
  assert.equal((await call('me', undefined, cookie)).status, 401);
  cookie = await login();
  result = await check(cookie);
  const confirmed = await call('location/confirm', { proceed: true, checkId: result.data.location.checkId }, cookie);
  assert.equal(confirmed.data.requiresPhoto, true);
  const image = await sharp({ create: { width: 320, height: 240, channels: 3, background: '#c09860' } }).jpeg().toBuffer();
  const photo = await fetch(base + 'photo', { method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'image/jpeg', 'X-Captured-At': String(Date.now()), 'X-Location-Check': result.data.location.checkId }, body: image });
  assert.equal(photo.status, 200);
  await pool.execute('DELETE FROM sessions WHERE employee_id=(SELECT id FROM employees WHERE username=?)', ['deepthi']);
  cookie = await login();
  result = await check(cookie);
  assert.equal(result.data.requiresConfirmation, true, 'Existing punch must not bypass consent');
  assert.equal(result.data.user, undefined);
  const resumed = await call('location/confirm', { proceed: true, checkId: result.data.location.checkId }, cookie);
  assert.equal(resumed.data.resumedPunchIn, true);
  assert.equal(resumed.data.user.location.status, 'offsite');
  assert.equal((await call('me', undefined, cookie)).status, 200);
  console.log('PASS: off-site consent, cancellation, forged check rejection, photo gate and existing-punch resume.');
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => pool.end());
