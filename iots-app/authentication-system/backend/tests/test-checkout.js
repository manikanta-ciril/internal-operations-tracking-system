const assert = require('node:assert/strict');
const sharp = require('sharp');
const fs = require('node:fs/promises');
const path = require('node:path');
const pool = require('../src/database/connection');
const office = require('../src/location/office-location.json');
const { checkoutPhotoRoot } = require('../src/evidence/photos');
if (!process.env.IOTS_TEST_BASE_URL || !process.env.DB_NAME?.endsWith('_test')) throw new Error('Run npm run test:auth from backend to use the isolated database.');
const base = process.env.IOTS_TEST_BASE_URL;
const checks = new Map();
const position = (delta = 0, accuracy = 1) => ({ latitude: office.latitude + delta, longitude: office.longitude, accuracy, timestamp: Date.now() });
async function call(route, body, cookie) {
  if (route.endsWith('/confirm') && body && !body.checkId) body = { ...body, checkId: checks.get(cookie)?.checkId };
  const response = await fetch(base + route, { method: body === undefined ? 'GET' : 'POST', headers: { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(cookie ? { Cookie: cookie } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  const data = await response.json();
  const nextCookie = response.headers.get('set-cookie')?.split(';')[0];
  if (data.location) checks.set(nextCookie || cookie, data.location);
  return { status: response.status, data, cookie: nextCookie };
}
async function main() {
  const jpeg = await sharp({ create: { width: 320, height: 240, channels: 3, background: '#c09860' } }).jpeg().toBuffer();
  async function photo(route, cookie, buffer = jpeg, timestamp = Date.now()) {
    const response = await fetch(base + route, { method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'image/jpeg', 'X-Captured-At': String(timestamp), 'X-Location-Check': checks.get(cookie)?.checkId || '' }, body: buffer });
    return { status: response.status, data: await response.json() };
  }
  async function signIn() {
    const login = await call('login', { username: 'vijay', password: 'Iots@123' });
    assert.equal(login.status, 200);
    assert.equal((await call('checkout/location', { position: position() }, login.cookie)).status, 403);
    await call('location', { position: position() }, login.cookie);
    const capture = await photo('photo', login.cookie); assert.equal(capture.status, 200);
    return { cookie: login.cookie, signInId: capture.data.photoId };
  }
  const session = await signIn();
  assert.equal((await call('logout', {}, session.cookie)).status, 409);
  assert.equal((await call('cancel', {}, session.cookie)).status, 409);
  assert.equal((await photo('checkout/photo', session.cookie)).status, 409);
  assert.equal((await call('checkout/location', { position: { ...position(), timestamp: Date.now() - 180000 } }, session.cookie)).status, 400);
  assert.equal((await call('checkout/location', { position: null }, session.cookie)).status, 400);
  const uncertain = await call('checkout/location', { position: position(.001, 100) }, session.cookie);
  assert.equal(uncertain.data.requiresConfirmation, true);
  assert.equal((await call('checkout/confirm', { proceed: 'yes' }, session.cookie)).status, 400);
  assert.equal((await call('checkout/confirm', { proceed: false }, session.cookie)).status, 200);
  assert.equal((await call('me', undefined, session.cookie)).status, 200);
  assert.equal((await photo('checkout/photo', session.cookie)).status, 409);
  const offsite = await call('checkout/location', { position: position(.001) }, session.cookie);
  assert.equal(offsite.data.location.status, 'offsite');
  assert.equal((await photo('checkout/photo', session.cookie)).status, 409);
  assert.equal((await call('checkout/confirm', { proceed: true }, session.cookie)).status, 200);
  assert.equal((await photo('checkout/photo', session.cookie, Buffer.from('bad jpeg'))).status, 400);
  assert.equal((await photo('checkout/photo', session.cookie, jpeg, Date.now() - 180000)).status, 400);
  await pool.execute('UPDATE checkout_checks SET checked_at=NOW()-INTERVAL 6 MINUTE WHERE session_hash=(SELECT session_hash FROM photo_evidence WHERE id=?)', [session.signInId]);
  assert.equal((await photo('checkout/photo', session.cookie)).status, 409);
  await call('checkout/location', { position: position(.001) }, session.cookie);
  await call('checkout/confirm', { proceed: true }, session.cookie);
  const results = await Promise.all([photo('checkout/photo', session.cookie), photo('checkout/photo', session.cookie)]);
  assert.equal(results.filter(result => result.status === 200).length, 1);
  assert.ok(results.every(result => [200, 401, 403, 409].includes(result.status)));
  const id = results.find(result => result.status === 200).data.photoId;
  assert.equal((await call('me', undefined, session.cookie)).status, 401);
  assert.equal((await photo('checkout/photo', session.cookie)).status, 401);
  const [[count]] = await pool.execute('SELECT COUNT(*) AS n FROM checkout_evidence WHERE sign_in_photo_id=?', [session.signInId]);
  assert.equal(count.n, 1);
  const [[record]] = await pool.execute('SELECT * FROM checkout_evidence WHERE id=?', [id]);
  assert.equal(record.details.kind, 'checkout'); assert.equal(record.details.location.status, 'offsite');
  assert.equal(record.details.signInPhotoId, session.signInId);
  assert.equal((await sharp(await fs.readFile(path.join(checkoutPhotoRoot, record.storage_path))).metadata()).format, 'webp');
  assert.equal((await fetch(base + 'checkout/photos/' + id)).status, 401);
  const second = await signIn();
  assert.equal((await fetch(base + 'checkout/photos/' + id, { headers: { Cookie: second.cookie } })).status, 200);
  await call('checkout/location', { position: position() }, second.cookie);
  await call('checkout/cancel', {}, second.cookie);
  assert.equal((await photo('checkout/photo', second.cookie)).status, 409);
  await call('checkout/location', { position: position() }, second.cookie);
  assert.equal((await photo('checkout/photo', second.cookie)).status, 200);
  console.log('PASS: checkout stage gates, stale GPS, exception decision, cancellation, invalid/expired photo, concurrent replay, persisted linked WebP and session termination.');
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => pool.end());
