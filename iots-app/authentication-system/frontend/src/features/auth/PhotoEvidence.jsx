import { useEffect, useRef, useState } from 'react';
import './auth-motion.css';

export default function PhotoEvidence({ employeeName, employeeUsername, employeeEmail, location, onSaved, onCancel, mode = 'signin', onSessionEnded, onLocationExpired }) {
  const video = useRef(null);
  const stream = useRef(null);
  const active = useRef(true);
  const operation = useRef(0);
  const capturedAt = useRef(0);
  const previewUrl = useRef('');
  const [ready, setReady] = useState(false);
  const [starting, setStarting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const heading = useRef(null);
  function stopCamera() { stream.current?.getTracks().forEach(track => track.stop()); stream.current = null; }
  useEffect(() => {
    active.current = true; heading.current?.focus();
    const invalidate = () => { operation.current++; };
    return () => { active.current = false; invalidate(); stopCamera(); URL.revokeObjectURL(previewUrl.current); };
  }, []);
  useEffect(() => {
    let permission;
    let live = true;
    const revoked = () => {
      if (permission.state === 'granted') return;
      operation.current++; setStarting(false); setUploading(false);
      stopCamera(); setReady(false); setPhoto(null);
      URL.revokeObjectURL(previewUrl.current); previewUrl.current = ''; setPreview('');
      setError('Camera permission was removed. Allow the camera again to continue.');
    };
    navigator.permissions?.query({ name: 'camera' }).then(status => {
      if (!live) return;
      permission = status; status.addEventListener('change', revoked);
    }).catch(() => {});
    return () => { live = false; permission?.removeEventListener('change', revoked); };
  }, []);
  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) { setError('Camera access requires a supported browser on localhost or HTTPS.'); return; }
    const version = ++operation.current;
    setStarting(true); setError(''); setReady(false);
    try {
      stopCamera();
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 960 }, height: { ideal: 720 } }, audio: false });
      if (!active.current || version !== operation.current) { media.getTracks().forEach(track => track.stop()); return; }
      stream.current = media;
      media.getVideoTracks()[0].onended = () => { if (active.current) { setReady(false); setError('Camera access ended. Allow the camera again to continue.'); } };
      setPhoto(null);
      URL.revokeObjectURL(previewUrl.current); previewUrl.current = ''; setPreview('');
      // The video stays mounted when a captured image is previewed.
      video.current.srcObject = media;
      await video.current.play();
    } catch (failure) {
      if (!active.current || version !== operation.current) return;
      stopCamera();
      if (active.current) setError(failure.name === 'NotAllowedError' ? 'Camera access is required. Allow Camera in this site’s settings, then try again.' : 'We couldn’t open your camera. Check that it is connected and not being used by another app.');
    } finally { if (active.current && version === operation.current) setStarting(false); }
  }
  async function capture() {
    if (!ready || !video.current?.videoWidth) return;
    const version = operation.current;
    const capturedTime = Date.now();
    setError('');
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 960 / video.current.videoWidth);
    canvas.width = Math.round(video.current.videoWidth * scale); canvas.height = Math.round(video.current.videoHeight * scale);
    canvas.getContext('2d').drawImage(video.current, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', .85));
    if (!active.current || version !== operation.current) return;
    if (!blob) { setError('Couldn’t capture that image. Please try again.'); return; }
    capturedAt.current = capturedTime; setPhoto(blob);
    URL.revokeObjectURL(previewUrl.current); previewUrl.current = URL.createObjectURL(blob); setPreview(previewUrl.current);
    setReady(false); stopCamera();
  }
  async function save() {
    if (!photo || uploading) return;
    const version = operation.current;
    const current = () => active.current && version === operation.current;
    if (!location?.checkId) { onLocationExpired?.('Get a fresh location reading before taking your photo.'); return; }
    setUploading(true); setError('');
    try {
      const response = await fetch(mode === 'checkout' ? '/api/auth/checkout/photo' : '/api/auth/photo', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'image/jpeg', 'X-Captured-At': String(capturedAt.current), 'X-Location-Check': location.checkId }, body: photo });
      const result = await response.json();
      if (!current()) return;
      if (!response.ok) throw Object.assign(new Error(result.message || 'The photo could not be saved. Please try again.'), { status: response.status });
      await onSaved(mode === 'checkout' ? result : result.user);
    } catch (failure) {
      if (!current()) return;
      // A failed response does not establish whether the server committed the photo.
      if (!failure.status || failure.status === 409) {
        try {
          const response = await fetch('/api/auth/me', { credentials: 'same-origin' });
          const result = await response.json();
          if (!current()) return;
          if (response.ok && mode === 'signin' && result.user?.username === employeeUsername && result.user.location?.checkId === location.checkId) { await onSaved(result.user); return; }
          if (response.status === 401 || (response.ok && result.user?.username !== employeeUsername)) {
            onSessionEnded?.('Your session has ended or changed. Please sign in again.'); return;
          }
        } catch { /* Preserve the capture for an explicit retry if reconciliation is unavailable. */ }
      }
      if (!current()) return;
      if (failure.status === 401) { onSessionEnded?.(failure.message); return; }
      if (failure.status === 409 && onLocationExpired) { onLocationExpired(failure.message); return; }
      setError(failure.message);
    } finally { if (current()) setUploading(false); }
  }
  if (!location) return <p role="alert">A fresh location check is required before photo capture.</p>;
  return <section className="photo-evidence auth-form-enter" aria-labelledby="photo-title">
    <p className="permission-caption">{mode === 'checkout' ? 'Checkout location checked' : 'Account and location checked'}</p>
    <h2 id="photo-title" tabIndex={-1} ref={heading}>{mode === 'checkout' ? 'One photo before you leave.' : 'One photo, then you are in.'}</h2>
    <p>Hi {employeeName}. Centre your face in the frame and make sure it’s clearly lit.</p>
    <div className={`camera-frame ${photo ? 'is-preview' : ''}`}>
      <video ref={video} autoPlay playsInline muted onLoadedData={() => setReady(true)} aria-label="Live camera preview"/>
      {preview && <img src={preview} alt={`Your captured ${mode === 'checkout' ? 'checkout' : 'sign-in'} photo`}/>}
      {!ready && !photo && <div className="camera-placeholder"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 4 7 7H4a2 2 0 0 0-2 2v10h20V9a2 2 0 0 0-2-2h-3l-2-3H9Z"/><circle cx="12" cy="12" r="4"/></svg><span>Your camera is off</span></div>}
      {!photo && ready && <div className="camera-guide" aria-hidden="true"/>}
      <span className="camera-badge">{photo ? 'Review your photo' : ready ? 'Camera on' : 'Camera permission required'}</span>
    </div>
    <p className="capture-privacy">{photo ? 'Check your photo before submitting. Only the photo you confirm will be saved.' : 'Your camera is used only for this photo. No audio or video is recorded.'}</p>
    {photo && <div className="photo-stamp-summary"><strong>Included on your saved photo</strong><p>{employeeName} / {employeeUsername}</p><p>{employeeEmail}</p><p>Lat {location.latitude?.toFixed(7) ?? 'unknown'} / Lon {location.longitude?.toFixed(7) ?? 'unknown'}</p><p>Status: {location.status === 'onsite' ? 'On-site' : location.status === 'offsite' ? 'Off-site' : 'Unknown'}</p></div>}
    {error && <p role="alert" className="capture-error">{error}</p>}
    <div className="capture-actions">{photo ? <><button type="button" disabled={uploading} onClick={startCamera}>Retake</button><button className="capture-primary" type="button" disabled={uploading} onClick={save}>{uploading ? 'Saving your photo…' : mode === 'checkout' ? 'Save checkout & log out' : 'Use photo & continue'}</button></> : <button className="capture-primary" type="button" disabled={starting} onClick={ready ? capture : startCamera}>{starting ? 'Opening camera…' : ready ? 'Take photo' : 'Allow camera'}</button>}</div>
    <button className="capture-cancel" type="button" disabled={uploading || starting} onClick={() => { stopCamera(); setReady(false); onCancel(); }}>{mode === 'checkout' ? 'Cancel checkout' : 'Cancel sign-in'}</button>
  </section>;
}
