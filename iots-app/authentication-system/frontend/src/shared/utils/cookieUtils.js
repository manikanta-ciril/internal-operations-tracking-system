/**
 * Persistent Cookie & LocalStorage Management for Location Permission
 */
export const setCookie = (name, value, days = 30) => {
  try {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = 'expires=' + d.toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=/; SameSite=Lax`;
  } catch (e) {
    console.warn('Cookie set error:', e);
  }
};

export const getCookie = (name) => {
  try {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  } catch (e) {
    console.warn('Cookie get error:', e);
  }
  return null;
};

export const getStoredLocationPermission = () => {
  const cookieVal = getCookie('ciril_loc_perm');
  if (cookieVal === 'granted' || cookieVal === 'denied') return cookieVal;
  try {
    const localVal =
      localStorage.getItem('ciril_loc_perm') || localStorage.getItem('ciril_location_permitted');
    if (localVal === 'granted' || localVal === 'denied') return localVal;
  } catch {}
  return null;
};

export const setStoredLocationPermission = (state) => {
  setCookie('ciril_loc_perm', state, 30);
  try {
    localStorage.setItem('ciril_loc_perm', state);
    localStorage.setItem('ciril_location_permitted', state);
  } catch {}
};
