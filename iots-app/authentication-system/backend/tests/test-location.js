const assert = require('node:assert/strict');
const { assessLocation } = require('../src/location/assess');
const office = { latitude: 17, longitude: 78, radiusMeters: 20 };
const fix = (metres, accuracy = 1) => ({ latitude: office.latitude + metres / 6371000 * 180 / Math.PI, longitude: office.longitude, accuracy, timestamp: Date.now() });
assert.equal(assessLocation(fix(0), office).status, 'onsite');
assert.equal(assessLocation(fix(18), office).status, 'onsite');
assert.equal(assessLocation(fix(20, 0), office).status, 'onsite');
assert.equal(assessLocation(fix(22), office).status, 'offsite');
assert.equal(assessLocation(fix(100), office).status, 'offsite');
assert.equal(assessLocation(fix(19, 8), office).status, 'onsite');
assert.equal(assessLocation(fix(0, 100), office).status, 'onsite');
assert.equal(assessLocation(null, office).status, 'unknown');
assert.equal(assessLocation({ ...fix(0), latitude: '17' }, office).status, 'unknown');
assert.equal(assessLocation({ ...fix(0), latitude: 91 }, office).status, 'unknown');
assert.equal(assessLocation({ ...fix(0), timestamp: Date.now() - 180000 }, office).status, 'unknown');
assert.equal(assessLocation(fix(0), { ...office, latitude: null }).status, 'unknown');
const widerOffice = { ...office, radiusMeters: 50 };
assert.equal(assessLocation(fix(40, 2), widerOffice).status, 'onsite');
assert.equal(assessLocation(fix(50, 0), widerOffice).status, 'onsite');
assert.equal(assessLocation(fix(55, 2), widerOffice).status, 'offsite');
assert.equal(assessLocation(fix(49, 5), widerOffice).status, 'onsite');
const configuredOffice = require('../src/location/office-location.json');
assert.equal(configuredOffice.radiusMeters, 75);
const currentFix = metres => ({ latitude: configuredOffice.latitude + metres / 6371000 * 180 / Math.PI, longitude: configuredOffice.longitude, timestamp: Date.now() });
for (const metres of [0, 18, 32.1, 74.9, 75]) {
  const location = assessLocation({ ...currentFix(metres), accuracy: 160 });
  assert.equal(location.status, 'onsite');
  assert.equal('accuracyMeters' in location, false);
}
assert.equal(assessLocation(currentFix(75)).status, 'onsite', 'Accuracy is not required.');
assert.equal(assessLocation(currentFix(75.1)).status, 'offsite');
assert.equal(assessLocation({ ...currentFix(80), accuracy: 1000 }).status, 'offsite', 'Accuracy cannot change an outside point to unknown.');
for (const [latitude, longitude] of [[17.430350744167615, 78.45646968277875], [17.430348501154466, 78.45633675951002]]) {
  assert.equal(assessLocation({ latitude, longitude, timestamp: Date.now() }).status, 'onsite', 'Previously uncertain photo coordinates are now inside.');
}
console.log('PASS: distance-only 20m, 50m and 75m boundaries; accuracy ignored; missing, malformed, stale and unconfigured coordinates rejected.');
