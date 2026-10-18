const sharp = require('sharp');
const path = require('node:path');
const fs = require('node:fs/promises');
const { randomUUID, createHash } = require('node:crypto');
const photoRoot = path.resolve(__dirname, '../../.local/uploads/check-in-photos');
async function preparePhoto(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 100) throw new Error('Capture a new photo using your camera.');
  const image = sharp(buffer, { limitInputPixels: 16000000, failOn: 'warning' });
  const info = await image.metadata();
  if (info.format !== 'jpeg' || info.width < 160 || info.height < 160) throw new Error('A valid camera JPEG of at least 160 × 160 pixels is required.');
  // Decode and re-encode instead of trusting the supplied filename or MIME type.
  return image.rotate().resize({ width: 1280, height: 1280, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
}
function photoDetails(capturedAt, location, uploadedAt = Date.now()) {
  const timeZone = 'Asia/Kolkata';
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(capturedAt)).map(part => [part.type, part.value]));
  const display = time => new Intl.DateTimeFormat('en-GB', { timeZone, weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(new Date(time)) + ' IST (UTC+05:30)';
  return { capturedAt: new Date(capturedAt).toISOString(), uploadedAt: new Date(uploadedAt).toISOString(), timeZone, capturedDisplay: display(capturedAt), uploadedDisplay: display(uploadedAt), locationDisplay: location.timestamp ? display(location.timestamp) : 'Not recorded', location: { ...location }, filenameDate: `${parts.year}-${parts.month}-${parts.day}_${parts.hour}-${parts.minute}-${parts.second}_IST` };
}
async function stampPhoto(buffer, employee, details) {
  const info = await sharp(buffer).metadata();
  const width = Math.max(720, info.width);
  const image = await sharp(buffer).resize({ width }).toBuffer();
  const size = await sharp(image).metadata();
  const footerHeight = 196;
  const loc = details.location;
  const coordinate = value => Number.isFinite(value) ? value.toFixed(7) : 'Unavailable';
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]);
  const lines = [
    `CIRIL | Sign-in photo evidence | ${employee.name.slice(0, 65)}`,
    `Captured: ${details.capturedDisplay}`,
    `Latitude: ${coordinate(loc.latitude)} | Longitude: ${coordinate(loc.longitude)}`,
    `GPS accuracy: +/-${loc.accuracyMeters ?? 'unknown'} m | Status: ${loc.status === 'onsite' ? 'On-site' : loc.status === 'offsite' ? 'Off-site' : 'Unknown'}`,
    `Office distance: ${loc.distanceMeters ?? 'unknown'} m | Office radius: ${loc.radiusMeters ?? 20} m`,
    `Location reading: ${details.locationDisplay}`,
    `Server received: ${details.uploadedDisplay}`,
  ];
  const footer = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${footerHeight}"><rect width="100%" height="100%" fill="#202830"/><rect width="48" height="3" x="20" y="0" fill="#c09860"/>${lines.map((line, index) => `<text x="20" y="${28 + index * 24}" font-family="Arial, sans-serif" font-size="14" fill="${index === 0 ? '#e5c99f' : '#f3f4f3'}">${escape(line)}</text>`).join('')}</svg>`);
  return sharp(image).extend({ bottom: footerHeight, background: '#202830' }).composite([{ input: footer, top: size.height, left: 0 }]).png().toBuffer();
}
async function storePhoto(buffer, employee, details) {
  const folder = employee.name.normalize('NFKD').replace(/[^a-zA-Z0-9 -]/g, '').trim().replace(/\s+/g, '-').slice(0, 100) || 'Employee';
  const id = randomUUID();
  const storagePath = `${folder}--${employee.id}/${id}-${details.filenameDate}.png`;
  buffer = await stampPhoto(buffer, employee, details);
  const absolutePath = path.join(photoRoot, storagePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, buffer, { flag: 'wx' });
  return { id, storagePath, absolutePath, size: buffer.length, sha256: createHash('sha256').update(buffer).digest('hex') };
}
module.exports = { preparePhoto, storePhoto, photoRoot, photoDetails, stampPhoto };
