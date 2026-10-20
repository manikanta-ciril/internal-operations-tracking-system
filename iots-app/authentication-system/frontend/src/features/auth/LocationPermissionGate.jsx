import { useCallback, useEffect, useRef, useState } from 'react';
import './auth-motion.css';

export default function LocationPermissionGate({ onGranted, checkout = false }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [permissionState, setPermissionState] = useState('checking');
  const live = useRef(true);
  const inFlight = useRef(false);
  const generation = useRef(0);
  const requestLocation = useCallback(() => {
    if (inFlight.current) return;
    if (!navigator.geolocation) { setError('This browser does not support location. Use a browser with location access.'); return; }
    const version = ++generation.current;
    inFlight.current = true;
    setBusy(true); setError('');
    navigator.geolocation.getCurrentPosition(fix => {
      if (!live.current || version !== generation.current) return;
      inFlight.current = false;
      setBusy(false);
      onGranted({ latitude: fix.coords.latitude, longitude: fix.coords.longitude, accuracy: fix.coords.accuracy, timestamp: fix.timestamp });
    }, failure => {
      if (!live.current || version !== generation.current) return;
      inFlight.current = false;
      setBusy(false); if (failure.code === 1) setPermissionState('denied');
      setError(failure.code === 1 ? 'Location access is blocked. Allow Location in this site’s browser settings, then try again.' : 'We couldn’t get a location reading. Check your device’s location settings and try again.');
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
  }, [onGranted]);
  useEffect(() => {
    live.current = true;
    const invalidate = () => { generation.current++; };
    let active = true;
    let permission;
    const update = () => {
      if (!active) return;
      setPermissionState(permission.state);
      if (permission.state === 'denied') { generation.current++; inFlight.current = false; setBusy(false); }
      if (permission.state === 'granted') requestLocation();
    };
    async function checkPermission() {
      try {
        if (!navigator.permissions?.query) { setPermissionState('prompt'); return; }
        permission = await navigator.permissions.query({ name: 'geolocation' });
        if (!active) return;
        permission.addEventListener('change', update);
        update();
      } catch { if (active) setPermissionState('prompt'); }
    }
    checkPermission();
    return () => { active = false; live.current = false; invalidate(); inFlight.current = false; permission?.removeEventListener('change', update); };
  }, [requestLocation]);
  const denied = permissionState === 'denied';
  const checking = permissionState === 'checking';
  const granted = permissionState === 'granted';
  if (busy || checking) return <section className="permission-gate location-loading auth-form-enter" aria-labelledby="location-loading-title" aria-busy="true">
    <div className="auth-emblem" aria-hidden="true">
      <svg className="auth-orbit" viewBox="0 0 100 100"><circle className="auth-orbit-track" cx="50" cy="50" r="45"/><circle className="auth-orbit-arc" cx="50" cy="50" r="45"/></svg>
      <svg className="auth-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>
    </div>
    <h2 id="location-loading-title">{checking ? 'Checking location access' : 'Getting your location'}</h2>
    <p role="status">{checking ? 'Checking your browser permission.' : permissionState === 'prompt' ? 'Allow location in your browser to continue.' : 'Finding a fresh position. This may take a moment.'}</p>
    <div className="location-loading-track" aria-hidden="true"><span/></div>
    <p className="permission-footnote">{checkout ? 'Your checkout will continue when your location is ready.' : 'The sign-in form will open when your location is ready.'}</p>
  </section>;
  return <section className="permission-gate auth-form-enter" aria-labelledby="permission-title">
    <div className="permission-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg></div>
    <p className="permission-caption">{checkout ? 'Before you check out' : 'Before you sign in'}</p>
    <h2 id="permission-title">{checking ? 'Checking location access…' : granted ? 'Location access is allowed.' : 'Allow location to continue.'}</h2>
    <p>{granted ? 'Getting a fresh position using your existing permission. You don’t need to allow it again.' : checkout ? 'Location is required to record your checkout against the office location.' : 'Location access is required to open the login form. We’ll compare your position with the office location when you sign in.'}</p>
    <div className="permission-details"><strong>A one-time check</strong><p>Your position is recorded for this {checkout ? 'checkout' : 'sign-in'}. We don’t continuously track your movements.</p></div>
    {denied && <ol className="permission-instructions"><li>Open site settings beside the address bar.</li><li>Set <strong>Location</strong> to <strong>Allow</strong>.</li><li>Return here and select Try again.</li></ol>}
    {error && <p role="alert" className="capture-error">{error}</p>}
    <button className="capture-primary" type="button" disabled={busy || checking} onClick={requestLocation}>{checking ? 'Checking permission…' : busy ? 'Getting your location…' : granted ? 'Retry location check' : denied ? 'Try again' : 'Allow location'}</button>
    <p className="permission-footnote">Your camera will be requested after {checkout ? 'the checkout location check' : 'your account and location checks'}.</p>
  </section>;
}
