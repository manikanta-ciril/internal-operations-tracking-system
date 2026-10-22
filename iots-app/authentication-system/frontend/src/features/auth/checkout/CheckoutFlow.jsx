import { useCallback, useEffect, useRef, useState } from 'react';
import { authApi } from '../api';
import LocationPermissionGate from '../LocationPermissionGate';
import LocationDecision from '../LocationDecision';
import PhotoEvidence from '../PhotoEvidence';
import './checkout.css';

export default function CheckoutFlow({ user, onComplete, onCancel, onSessionEnded }) {
  const [phase, setPhase] = useState('location');
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const live = useRef(true);
  const attempt = useRef(0);
  const lastLocation = useRef(null);
  const current = version => live.current && version === attempt.current;
  useEffect(() => {
    live.current = true;
    const invalidate = () => { attempt.current++; };
    return () => { live.current = false; invalidate(); };
  }, []);
  useEffect(() => {
    let permission; let disposed = false;
    const revoked = () => {
      if (permission.state === 'granted') return;
      attempt.current++; setBusy(false); setPhase('location'); setLocation(null);
      const checkId = lastLocation.current?.checkId; lastLocation.current = null;
      if (checkId) authApi('checkout/cancel', { checkId }).catch(() => {});
    };
    navigator.permissions?.query({ name: 'geolocation' }).then(status => {
      if (disposed) return;
      permission = status; permission.addEventListener('change', revoked);
    }).catch(() => {});
    return () => { disposed = true; permission?.removeEventListener('change', revoked); };
  }, []);
  const checkLocation = useCallback(async position => {
    const version = ++attempt.current;
    setPhase('checking'); setError('');
    try {
      const result = await authApi('checkout/location', { position });
      if (!live.current || version !== attempt.current) return;
      lastLocation.current = result.location; setLocation(result.location);
      setPhase(result.requiresConfirmation ? 'decision' : 'photo');
    } catch (failure) {
      if (!live.current || version !== attempt.current) return;
      if (failure.status === 401) onSessionEnded();
      else { setError(failure.message); setPhase('retry'); }
    }
  }, [onSessionEnded]);
  async function cancel() {
    const version = ++attempt.current;
    setBusy(true); setError('');
    try { await authApi('checkout/cancel', { checkId: lastLocation.current?.checkId }); if (current(version)) onCancel(); }
    catch (failure) { if (!current(version)) return; if (failure.status === 401) onSessionEnded(); else setError(failure.message); }
    finally { if (current(version)) setBusy(false); }
  }
  function retryLocation(message) {
    attempt.current++; lastLocation.current = null; setLocation(null); setBusy(false);
    setError(message || 'Get a fresh punch-out location reading.'); setPhase('retry');
  }
  async function confirm() {
    const version = attempt.current;
    setBusy(true); setError('');
    try {
      const result = await authApi('checkout/confirm', { proceed: true, checkId: lastLocation.current?.checkId });
      if (!current(version)) return;
      lastLocation.current = result.location; setLocation(result.location); setPhase('photo');
    } catch (failure) {
      if (!current(version)) return;
      if (failure.status === 401) onSessionEnded(); else retryLocation(failure.message);
    } finally { if (current(version)) setBusy(false); }
  }
  return <div className="checkout-flow auth-form-enter">
    <h1 tabIndex={-1}>Punch out</h1>
    <p className="checkout-intro">Record your location and a photo to finish this session.</p>
    {phase === 'location' && <LocationPermissionGate checkout onGranted={checkLocation}/>}
    {phase === 'checking' && <p role="status">Checking your punch-out location...</p>}
    {phase === 'decision' && <LocationDecision checkout inline location={location} onContinue={confirm} onCancel={cancel} busy={busy}/>}
    {phase === 'photo' && location && <div className="photo-shell"><PhotoEvidence mode="checkout" employeeName={user.name} employeeUsername={user.username} employeeEmail={user.email} location={location} onSaved={onComplete} onCancel={cancel} onSessionEnded={onSessionEnded} onLocationExpired={retryLocation}/></div>}
    {error && <p className="capture-error" role="alert">{error}</p>}
    {phase === 'retry' && <button className="capture-primary" type="button" onClick={() => { setError(''); setPhase('location'); }}>Retry location check</button>}
    {!['photo', 'decision'].includes(phase) && <button type="button" className="capture-cancel" disabled={busy || phase === 'checking'} onClick={cancel}>Cancel punch-out</button>}
  </div>;
}
