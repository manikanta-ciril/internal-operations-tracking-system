const sharp = require('sharp');
const { encodeEvidence } = require('./encode');
const path = require('node:path');
const fs = require('node:fs/promises');
const { randomUUID, createHash } = require('node:crypto');
const evidenceRoot = process.env.IOTS_EVIDENCE_ROOT || path.join(require('../config/paths').local, 'uploads');
const photoRoot = path.join(evidenceRoot, 'check-in-photos');
const checkoutPhotoRoot = path.join(evidenceRoot, 'check-out-photos');
async function preparePhoto(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 100) throw new Error('Capture a new photo using your camera.');
  const image = sharp(buffer, { limitInputPixels: 16000000, failOn: 'warning' });
  const info = await image.metadata();
  if (info.format !== 'jpeg' || info.width < 160 || info.height < 160) throw new Error('A valid camera JPEG of at least 160 × 160 pixels is required.');
  // Decode and re-encode instead of trusting the supplied filename or MIME type.
  return image.rotate().resize({ width: 960, height: 960, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 90 }).toBuffer();
}
function photoDetails(capturedAt, location, uploadedAt = Date.now()) {
  const timeZone = 'Asia/Kolkata';
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(capturedAt)).map(part => [part.type, part.value]));
  const display = time => new Intl.DateTimeFormat('en-GB', { timeZone, weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(new Date(time)) + ' IST (UTC+05:30)';
  return { capturedAt: new Date(capturedAt).toISOString(), uploadedAt: new Date(uploadedAt).toISOString(), timeZone, capturedDisplay: display(capturedAt), uploadedDisplay: display(uploadedAt), locationDisplay: location.timestamp ? display(location.timestamp) : 'Not recorded', location: { ...location }, filenameDate: `${parts.year}-${parts.month}-${parts.day}_${parts.hour}-${parts.minute}-${parts.second}_IST` };
}
function evidenceTitle(kind) { return kind === 'checkout' ? 'Punch-out photo evidence' : 'Punch-in photo evidence'; }
async function stampPhoto(buffer, employee, details) {
  const info = await sharp(buffer).metadata();
  const width = Math.max(720, info.width);
  const image = await sharp(buffer).resize({ width }).toBuffer();
  const size = await sharp(image).metadata();
  const headerHeight = 136;
  const footerHeight = 336;
  const loc = details.location;
  const coordinate = value => Number.isFinite(value) ? value.toFixed(7) : 'Unavailable';
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]);
  const lines = [
    ['Name', employee.name],
    ['Email', employee.email || `${employee.username || 'unavailable'}@ciril.in`],
    ['Username', employee.username || 'Unavailable'],
    ['Latitude', coordinate(loc.latitude)],
    ['Longitude', coordinate(loc.longitude)],
    ['Date', new Intl.DateTimeFormat('en-GB', { timeZone: details.timeZone, weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(details.capturedAt))],
    ['Time', new Intl.DateTimeFormat('en-GB', { timeZone: details.timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(new Date(details.capturedAt)) + ' IST (UTC+05:30)'],
    ['Status', loc.status === 'onsite' ? 'On-site' : loc.status === 'offsite' ? 'Off-site' : 'Unknown'],
  ];
  const header = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${headerHeight}"><rect width="100%" height="100%" fill="#202830"/><text x="${width / 2}" y="112" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="600" fill="#f8f8f8">${evidenceTitle(details.kind)}</text><rect x="${width - 244}" y="12" width="220" height="64" rx="8" fill="#ffffff"/></svg>`);
  // Remove the asset's empty margins before sizing and centring the visible mark.
  const logo = await sharp(path.join(require('../config/paths').frontend, 'src/assets/logo.png')).trim().resize(188, 44, { fit: 'inside' }).png().toBuffer();
  const logoSize = await sharp(logo).metadata();
  const footer = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${footerHeight}"><rect width="100%" height="100%" fill="#202830"/><rect width="48" height="3" x="24" y="0" fill="#c09860"/>${lines.map(([label, value], index) => `<text x="24" y="${38 + index * 39}" font-family="Arial, sans-serif" font-size="${Math.min(24, (width - 185) / Math.max(String(value).length, 1) / 0.6)}" fill="#f8f8f8"><tspan fill="#e5c99f">${label}: </tspan><tspan dx="8">${escape(value)}</tspan></text>`).join('')}</svg>`);
  return encodeEvidence(sharp(image).extend({ top: headerHeight, bottom: footerHeight, background: '#202830' }).composite([{ input: header, top: 0, left: 0 }, { input: logo, top: 12 + Math.floor((64 - logoSize.height) / 2), left: width - 244 + Math.floor((220 - logoSize.width) / 2) }, { input: footer, top: headerHeight + size.height, left: 0 }]));
}
async function storePhoto(buffer, employee, details) {
  const folder = employee.name.normalize('NFKD').replace(/[^a-zA-Z0-9 -]/g, '').trim().replace(/\s+/g, '-').slice(0, 100) || 'Employee';
  const id = randomUUID();
  const storagePath = `${folder}--${employee.id}/${id}-${details.filenameDate}.webp`;
  buffer = await stampPhoto(buffer, employee, details);
  const absolutePath = path.join(details.kind === 'checkout' ? checkoutPhotoRoot : photoRoot, storagePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  try { await fs.writeFile(absolutePath, buffer, { flag: 'wx' }); }
  catch (error) { if (error.code !== 'EEXIST') await fs.unlink(absolutePath).catch(() => {}); throw error; }
  return { id, storagePath, absolutePath, size: buffer.length, sha256: createHash('sha256').update(buffer).digest('hex') };
}
module.exports = { evidenceTitle, preparePhoto, storePhoto, photoRoot, checkoutPhotoRoot, photoDetails, stampPhoto };
