const assert = require('node:assert/strict');
const sharp = require('sharp');
const pool = require('../src/database/connection');
const office = require('../src/location/office-location.json');
if (process.env.DB_NAME !== 'iots_auth_fix_test' || !process.env.IOTS_TEST_BASE_URL) throw new Error('Use the isolated test runner.');
const base = process.env.IOTS_TEST_BASE_URL;
const position = () => ({ latitude: office.latitude, longitude: office.longitude, accuracy: 1, timestamp: Date.now() });
async function call(route, cookie, body) {
  const res = await fetch(base + route, { method: body === undefined ? 'GET' : 'POST', headers: { Cookie: cookie || '', 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: res.status, data: await res.json(), cookie: res.headers.get('set-cookie')?.split(';')[0] };
}
(async () => {
  const jpeg = await sharp({ create: { width: 320, height: 240, channels: 3, background: '#c09860' } }).jpeg().toBuffer();
  const photo = async (cookie, checkId, time = Date.now()) => {
    const res = await fetch(base + 'photo', { method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'image/jpeg', 'X-Captured-At': String(time), 'X-Location-Check': checkId || '' }, body: jpeg });
    return { status: res.status, data: await res.json() };
  };
  const login = async () => (await call('login', '', { username: 'manasa', password: 'Iots@123' })).cookie;
  for (let n = 0; n < 10; n++) assert.equal((await call('login', '', { username: 'rate-target', password: 'wrong' })).status, 401);
  assert.equal((await call('login', '', { username: 'rate-target@ciril.in', password: 'wrong' })).status, 429);
  const cookie = await login();
  assert.ok(cookie, 'Another account must remain able to sign in.');
  assert.equal((await call('login', '', { username: 'rate-target', password: 'wrong' })).status, 429);
  const concurrent = await Promise.all([call('location', cookie, { position: position() }), call('location', cookie, { position: position() })]);
  assert.deepEqual(concurrent.map(r => r.status).sort(), [200, 409]);
  const location = concurrent.find(r => r.status === 200).data.location;
  assert.equal((await photo(cookie, 'stale-check')).status, 409);
  assert.equal((await photo(cookie, location.checkId, Date.now() - 30000)).status, 400);
  const both = await Promise.all([photo(cookie, location.checkId), photo(cookie, location.checkId)]);
  assert.deepEqual(both.map(r => r.status).sort(), [200, 409]);
  assert.equal((await call('cancel', cookie, {})).status, 409);
  assert.equal((await call('location', cookie, { position: position() })).status, 409);
  assert.equal((await call('me', cookie)).status, 200);
  const [rows] = await pool.execute('SELECT id FROM photo_evidence WHERE id=?', [both.find(r => r.status === 200).data.photoId]); assert.equal(rows.length, 1);
  // Once cancellation commits, no delayed photo/location transition may survive it.
  const cancelled = await login();
  const checked = await call('location', cancelled, { position: position() });
  assert.equal((await call('cancel', cancelled, {})).status, 200);
  assert.equal((await photo(cancelled, checked.data.location.checkId)).status, 401);
  const uncertain = await login();
  const check = await call('location', uncertain, { position: { ...position(), accuracy: 100 } });
  assert.equal((await call('location/confirm', uncertain, { proceed: true, checkId: 'wrong' })).status, 409);
  const confirm = await call('location/confirm', uncertain, { proceed: true, checkId: check.data.location.checkId }); assert.equal(confirm.status, 200);
  assert.equal((await call('location/confirm', uncertain, { proceed: false, checkId: check.data.location.checkId })).status, 409);
  assert.equal((await photo(uncertain, confirm.data.location.checkId)).status, 200);
  console.log('PASS: atomic location/photo transitions, stale check rejection, old capture rejection and cancellation boundaries.');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => pool.end());
