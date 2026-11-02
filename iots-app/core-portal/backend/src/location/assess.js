const office = require('./office-location.json');
function assessLocation(position, configuration = office) {
  const result = { status: 'unknown', reason: 'Location is unavailable.', radiusMeters: configuration.radiusMeters, distanceMeters: null };
  if (configuration.latitude === null || configuration.longitude === null) return { ...result, reason: 'Office coordinates have not been configured yet.' };
  if (!position) return result;
  const { latitude, longitude, timestamp } = position;
  if (![latitude, longitude, timestamp].every(Number.isFinite) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180 || Math.abs(Date.now() - timestamp) > 120000) return { ...result, reason: 'Location is invalid or more than two minutes old.' };
  const radians = degrees => degrees * Math.PI / 180;
  const a = Math.sin(radians(latitude - configuration.latitude) / 2) ** 2 + Math.cos(radians(latitude)) * Math.cos(radians(configuration.latitude)) * Math.sin(radians(longitude - configuration.longitude) / 2) ** 2;
  const distance = 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
  const status = distance <= configuration.radiusMeters + 0.000001 ? 'onsite' : 'offsite';
  return { ...result, status, distanceMeters: Math.round(distance * 10) / 10, latitude, longitude, timestamp,
    reason: status === 'onsite' ? 'Within the office radius.' : 'Outside the office radius.' };
}
module.exports = { assessLocation };
