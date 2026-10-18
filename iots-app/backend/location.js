const office = require('./office-location.json');
function assessLocation(position, configuration = office) {
  const result = { status: 'unknown', reason: 'Location is unavailable.', radiusMeters: configuration.radiusMeters, distanceMeters: null, accuracyMeters: null };
  if (configuration.latitude === null || configuration.longitude === null) return { ...result, reason: 'Office coordinates have not been configured yet.' };
  if (!position) return result;
  const { latitude, longitude, accuracy, timestamp } = position;
  if (![latitude, longitude, accuracy, timestamp].every(Number.isFinite) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180 || accuracy < 0 || Math.abs(Date.now() - timestamp) > 120000) return { ...result, reason: 'Location is invalid or more than two minutes old.' };
  const radians = degrees => degrees * Math.PI / 180;
  const a = Math.sin(radians(latitude - configuration.latitude) / 2) ** 2 + Math.cos(radians(latitude)) * Math.cos(radians(configuration.latitude)) * Math.sin(radians(longitude - configuration.longitude) / 2) ** 2;
  const distance = 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
  const status = distance + accuracy <= configuration.radiusMeters + 0.000001 ? 'onsite' : distance - accuracy > configuration.radiusMeters ? 'offsite' : 'unknown';
  return { ...result, status, distanceMeters: Math.round(distance * 10) / 10, accuracyMeters: accuracy, latitude, longitude, timestamp,
    reason: status === 'onsite' ? 'Within the office radius.' : status === 'offsite' ? 'Outside the office radius.' : 'Location accuracy overlaps the office boundary. On-site presence cannot be confirmed.' };
}
module.exports = { assessLocation };
