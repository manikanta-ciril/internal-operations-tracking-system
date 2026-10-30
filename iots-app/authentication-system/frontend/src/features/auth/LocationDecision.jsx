import Spinner from "../../shared/feedback/Spinner";
import { formatDistance } from "../../shared/ui/distance";
import { useEffect, useRef } from 'react';
import './auth-motion.css';

export default function LocationDecision({ location, onContinue, onCancel, busy, error, inline = false, checkout = false }) {
  const heading = useRef(null);
  useEffect(() => { heading.current?.focus(); }, []);
  return <section className={`location-decision ${inline ? 'location-inline' : ''}`} aria-labelledby="location-title">
    {!inline && <><div className="location-symbol" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg></div>
    <span className="location-verified">Account verified</span></>}
    <h2 id="location-title" tabIndex={-1} ref={heading}>{location.status === 'offsite' ? 'You’re outside the office.' : 'We couldn’t confirm your location.'}</h2>
    <p>{location.reason} You can continue. Your session will be marked <strong>{location.status === 'offsite' ? 'off-site' : 'location unknown'}</strong>.</p>
    <dl className="location-facts"><div><dt>Office radius</dt><dd>{location.radiusMeters} metres</dd></div>{location.distanceMeters !== null && <div><dt>Distance from office</dt><dd>{formatDistance(location.distanceMeters)}</dd></div>}</dl>
    <p className="location-decision-note">{checkout ? 'Continue to capture your punch-out photo, or return to your workspace.' : 'Continue to capture your sign-in photo. Off-site access is available only if you have not started an office session today.'} Your decision is recorded.</p>
    {error && <p className="location-error" role="alert">{error}</p>}
    <div className="location-actions"><button type="button" disabled={busy} onClick={onCancel}>{checkout ? 'Cancel punch-out' : 'Cancel sign-in'}</button><button className="location-continue" type="button" disabled={busy} aria-busy={busy || undefined} onClick={onContinue}>{busy && <Spinner/>}{busy ? 'Please wait…' : checkout ? 'Continue punch-out' : 'Continue sign-in'}</button></div>
  </section>;
}
