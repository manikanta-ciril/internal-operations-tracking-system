const assert = require('node:assert/strict');
const sharp = require('sharp');
const { randomBytes } = require('node:crypto');
const { encodeEvidence, targetBytes } = require('../src/evidence/encode');
async function main() {
  const plain = sharp({ create: { width: 960, height: 720, channels: 3, background: '#c09860' } });
  const simple = await encodeEvidence(plain);
  assert.equal((await sharp(simple).metadata()).format, 'webp');
  assert.ok(simple.length < targetBytes);
  const detailed = sharp(randomBytes(960 * 720 * 3), { raw: { width: 960, height: 720, channels: 3 } });
  const complex = await encodeEvidence(detailed);
  const info = await sharp(complex).metadata();
  assert.equal(info.width, 960); assert.equal(info.height, 720);
  assert.ok(complex.length > targetBytes, 'Highly detailed images keep the quality floor instead of being forced below the size target.');
  assert.ok(complex.length < (await detailed.clone().png().toBuffer()).length);
  assert.equal(info.exif, undefined);
  console.log('PASS: WebP encoding, small-image path, detailed-image fallback, soft size target, dimensions and stripped EXIF.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
