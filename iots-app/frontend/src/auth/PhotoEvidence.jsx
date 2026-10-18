import { useEffect, useRef, useState } from 'react';
import './auth-motion.css';

export default function PhotoEvidence({ employeeName, location, onSaved, onCancel }) {
  const video = useRef(null);
  const stream = useRef(null);
  const active = useRef(true);
  const capturedAt = useRef(0);
  const previewUrl = useRef('');
  const [ready, setReady] = useState(false);
  const [starting, setStarting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [captureTime, setCaptureTime] = useState(null);
  const heading = useRef(null);
  function stopCamera() { stream.current?.getTracks().forEach(track => track.stop()); stream.current = null; }
  useEffect(() => {
    active.current = true; heading.current?.focus();
    return () => { active.current = false; stopCamera(); URL.revokeObjectURL(previewUrl.current); };
  }, []);
  useEffect(() => {
    let permission;
    let live = true;
    const revoked = () => {
      if (permission.state !== 'denied') return;
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
    setStarting(true); setError(''); setReady(false);
    try {
      stopCamera();
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 960 }, height: { ideal: 720 } }, audio: false });
      if (!active.current) { media.getTracks().forEach(track => track.stop()); return; }
      stream.current = media;
      media.getVideoTracks()[0].onended = () => { if (active.current) { setReady(false); setError('Camera access ended. Allow the camera again to continue.'); } };
      setPhoto(null);
      URL.revokeObjectURL(previewUrl.current); previewUrl.current = ''; setPreview('');
      // The video stays mounted when a captured image is previewed.
      video.current.srcObject = media;
      await video.current.play();
    } catch (failure) {
      stopCamera();
      if (active.current) setError(failure.name === 'NotAllowedError' ? 'Camera access is required. Allow Camera in this site’s settings, then try again.' : 'We couldn’t open your camera. Check that it is connected and not being used by another app.');
    } finally { if (active.current) setStarting(false); }
  }
  async function capture() {
    if (!ready || !video.current?.videoWidth) return;
    setError('');
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 960 / video.current.videoWidth);
    canvas.width = Math.round(video.current.videoWidth * scale); canvas.height = Math.round(video.current.videoHeight * scale);
    canvas.getContext('2d').drawImage(video.current, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', .85));
    if (!active.current) return;
    if (!blob) { setError('Couldn’t capture that image. Please try again.'); return; }
    capturedAt.current = Date.now(); setCaptureTime(capturedAt.current); setPhoto(blob);
    URL.revokeObjectURL(previewUrl.current); previewUrl.current = URL.createObjectURL(blob); setPreview(previewUrl.current);
    setReady(false); stopCamera();
  }
  async function save() {
    if (!photo || uploading) return;
    setUploading(true); setError('');
    try {
      const response = await fetch('/api/auth/photo', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'image/jpeg', 'X-Captured-At': String(capturedAt.current) }, body: photo });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'The photo could not be saved. Please try again.');
      if (active.current) await onSaved(result.user);
    } catch (failure) { if (active.current) setError(failure.message); }
    finally { if (active.current) setUploading(false); }
  }
  return <section className="photo-evidence auth-form-enter" aria-labelledby="photo-title">
    <p className="permission-caption">Account and location checked</p>
    <h2 id="photo-title" tabIndex={-1} ref={heading}>One photo, then you’re in.</h2>
    <p>Hi {employeeName}. Centre your face in the frame and make sure it’s clearly lit.</p>
    <div className={`camera-frame ${photo ? 'is-preview' : ''}`}>
      <video ref={video} autoPlay playsInline muted onLoadedData={() => setReady(true)} aria-label="Live camera preview"/>
      {preview && <img src={preview} alt="Your captured sign-in photo"/>}
      {!ready && !photo && <div className="camera-placeholder"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 4 7 7H4a2 2 0 0 0-2 2v10h20V9a2 2 0 0 0-2-2h-3l-2-3H9Z"/><circle cx="12" cy="12" r="4"/></svg><span>Your camera is off</span></div>}
      {!photo && ready && <div className="camera-guide" aria-hidden="true"/>}
      <span className="camera-badge">{photo ? 'Review your photo' : ready ? 'Camera on' : 'Camera permission required'}</span>
    </div>
    <p className="capture-privacy">{photo ? 'Check your photo before submitting. Only the photo you confirm will be saved.' : 'Your camera is used only for this photo. No audio or video is recorded.'}</p>
    {photo && captureTime && <div className="photo-stamp-summary"><strong>Included on your saved photo</strong><p>{new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(new Date(captureTime))} IST</p><p>Lat {location.latitude?.toFixed(7) ?? 'unknown'} · Lon {location.longitude?.toFixed(7) ?? 'unknown'} · Accuracy ±{location.accuracyMeters ?? 'unknown'} m</p></div>}
    {error && <p role="alert" className="capture-error">{error}</p>}
    <div className="capture-actions">{photo ? <><button type="button" disabled={uploading} onClick={startCamera}>Retake</button><button className="capture-primary" type="button" disabled={uploading} onClick={save}>{uploading ? 'Saving your photo…' : 'Use photo & continue'}</button></> : <button className="capture-primary" type="button" disabled={starting} onClick={ready ? capture : startCamera}>{starting ? 'Opening camera…' : ready ? 'Take photo' : 'Allow camera'}</button>}</div>
    <button className="capture-cancel" type="button" disabled={uploading || starting} onClick={() => { stopCamera(); setReady(false); onCancel(); }}>Cancel sign-in</button>
  </section>;
}
