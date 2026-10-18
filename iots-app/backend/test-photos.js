const assert = require('node:assert/strict');
const sharp = require('sharp');
const { preparePhoto, photoDetails, stampPhoto } = require('./photos');
async function main() {
  await assert.rejects(() => preparePhoto(Buffer.from('not a photo')));
  const png = await sharp({ create: { width: 320, height: 240, channels: 3, background: 'white' } }).png().toBuffer();
  await assert.rejects(() => preparePhoto(png));
  const small = await sharp({ create: { width: 80, height: 80, channels: 3, background: 'white' } }).jpeg().toBuffer();
  await assert.rejects(() => preparePhoto(small));
  const large = await sharp({ create: { width: 2000, height: 1600, channels: 3, background: 'white' } }).jpeg().toBuffer();
  const output = await preparePhoto(large);
  const metadata = await sharp(output).metadata();
  assert.equal(metadata.format, 'jpeg');
  assert.ok(metadata.width <= 1280 && metadata.height <= 1280);
  assert.equal(metadata.exif, undefined);
  const capture = Date.parse('2026-10-18T19:45:06Z');
  const details = photoDetails(capture, { latitude: 17.4327379, longitude: 78.4560819, accuracyMeters: 2, status: 'onsite', distanceMeters: 0, radiusMeters: 20, timestamp: capture - 30000 }, capture + 1000);
  assert.equal(details.filenameDate, '2026-10-19_01-15-06_IST');
  assert.match(details.capturedDisplay, /Monday, 19 October 2026/);
  assert.match(details.capturedDisplay, /01:15:06 IST/);
  const stamped = await stampPhoto(output, { name: 'Test Employee <&>' }, details);
  const stampedInfo = await sharp(stamped).metadata();
  assert.equal(stampedInfo.format, 'png');
  assert.equal(stampedInfo.height, metadata.height + 196);
  assert.equal(stampedInfo.width, metadata.width);
  console.log('PASS: image validation, PNG evidence footer, escaped names, IST midnight date/weekday and timestamped filename.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
