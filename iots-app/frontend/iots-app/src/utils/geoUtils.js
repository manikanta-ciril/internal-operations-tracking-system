/**
 * Geolocation & Reverse Geocoding Utilities
 */
let lastGeocodeCache = { lat: 0, lon: 0, locality: '', fullAddress: '' };

// [PLUG-IN INDICATION: SERVER-SIDE REVERSE GEOCODING PROXY]
// In enterprise deployments, proxy geocoding through your backend API to prevent rate-limits and CORS:
// const res = await fetch(`/api/v1/geo/reverse?lat=${lat}&lon=${lon}`);
export const reverseGeocode = async (lat, lon) => {
  const dist = Math.abs(lat - lastGeocodeCache.lat) + Math.abs(lon - lastGeocodeCache.lon);
  if (dist < 0.0005 && lastGeocodeCache.locality) {
    return lastGeocodeCache;
  }

  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    if (res.ok) {
      const data = await res.json();
      const locality = [data.locality, data.city, data.principalSubdivision]
        .filter(Boolean)
        .join(', ');
      const result = {
        locality:
          locality || `${data.city || 'Hyderabad'}, ${data.principalSubdivision || 'Telangana'}`,
        fullAddress: `${data.locality ? data.locality + ', ' : ''}${data.city || ''}, ${data.principalSubdivision || ''}, ${data.countryName || 'India'}`,
      };
      lastGeocodeCache = { lat, lon, ...result };
      return result;
    }
  } catch (e) {
    console.warn('Reverse geocode fetch skipped:', e.message);
  }
  return null;
};
