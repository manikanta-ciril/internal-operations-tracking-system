// A soft size target: keep a quality floor rather than blur difficult images.
const targetBytes = 180 * 1024;
const options = { quality: 82, effort: 4, smartSubsample: true };
async function encodeEvidence(image) {
  const normal = await image.clone().webp(options).toBuffer();
  if (normal.length <= targetBytes) return normal;
  const compact = await image.clone().webp({ ...options, quality: 76 }).toBuffer();
  return compact.length < normal.length ? compact : normal;
}
module.exports = { encodeEvidence, targetBytes };
