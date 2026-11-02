import { useCallback, useEffect, useRef, useState } from 'react';
import { Dialog } from 'radix-ui';
import { Button } from '@heroui/button';
import { BellRing, Camera, Check, LoaderCircle, MapPin, ShieldCheck, X } from 'lucide-react';
import { permissionNames, readPermission, requestPermission } from './browser-permissions';
import './permission-preflight.css';

const items = [
  { name: 'geolocation', title: 'Location', detail: 'Validates your office location for punch-in and punch-out.', Icon: MapPin },
  { name: 'camera', title: 'Camera', detail: 'Captures your attendance photo when you punch in or out.', Icon: Camera },
  { name: 'notifications', title: 'Desktop notifications', detail: 'Required to access team messages and receive message alerts.', Icon: BellRing },
];
const labels = { checking: 'Checking', granted: 'Allowed', prompt: 'Action needed', denied: 'Blocked', unsupported: 'Unavailable' };

export default function PermissionPreflight({ onReady }) {
  const [open, setOpen] = useState(true);
  const [states, setStates] = useState(Object.fromEntries(permissionNames.map(name => [name, 'checking'])));
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');
  const live = useRef(false);
  const requestBusy = useRef(false);
  const revision = useRef(0);
  const refresh = useCallback(async () => {
    const version = ++revision.current;
    const values = await Promise.all(permissionNames.map(readPermission));
    if (live.current && version === revision.current) setStates(previous => Object.fromEntries(permissionNames.map((name, index) => [name, values[index] ?? (previous[name] === 'checking' ? 'prompt' : previous[name])])));
  }, []);
  useEffect(() => {
    live.current = true;
    let disposed = false;
    const statuses = [];
    const sync = () => { if (!requestBusy.current) refresh(); };
    refresh();
    if (navigator.permissions?.query) for (const name of permissionNames) navigator.permissions.query({ name }).then(status => {
      if (disposed) return;
      statuses.push(status);
      status.addEventListener('change', sync);
    }).catch(() => {});
    window.addEventListener('focus', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      disposed = true;
      live.current = false;
      statuses.forEach(status => status.removeEventListener('change', sync));
      window.removeEventListener('focus', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [refresh]);
  async function allow(name) {
    if (requestBusy.current) return;
    requestBusy.current = true;
    setBusy(name); setError('');
    revision.current++;
    try {
      await requestPermission(name);
      if (live.current) setStates(previous => ({ ...previous, [name]: 'granted' }));
    } catch (error) {
      if (live.current) {
        setError(error.name === 'NotAllowedError' || error.code === 1 ? 'Access was not granted. Open site settings beside the address bar, allow this permission, then check again.' : error.name === 'NotFoundError' ? 'No camera was found. Connect a camera and try again.' : error.message || 'The permission check failed. Check device settings and try again.');
        const state = await readPermission(name);
        if (live.current) setStates(previous => ({ ...previous, [name]: state ?? 'prompt' }));
      }
    } finally {
      requestBusy.current = false;
      if (live.current) setBusy(null);
    }
  }
  const ready = permissionNames.every(name => states[name] === 'granted');
  useEffect(() => {
    if (!ready || !open) return;
    const timer = setTimeout(onReady, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 600);
    return () => clearTimeout(timer);
  }, [ready, open, onReady]);
  async function proceed() {
    if (!ready || requestBusy.current) return;
    const values = await Promise.all(permissionNames.map(readPermission));
    if (!live.current) return;
    if (values.some(value => value && value !== 'granted')) { await refresh(); return; }
    onReady();
  }
  return <>
    <div className="permission-gate"><h2>Prepare your browser</h2><p>Review the permissions needed for attendance and team messages before signing in.</p><Button className="capture-primary" onPress={() => setOpen(true)}>Review permissions</Button></div>
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="permission-check-overlay" />
        <Dialog.Content className="permission-check-dialog" aria-describedby="permission-check-description">
          <Dialog.Close className="permission-check-close" aria-label="Close permission check"><X size={19} /></Dialog.Close>
          <div className={`permission-check-emblem ${ready ? 'is-ready' : busy || permissionNames.some(name => states[name] === 'checking') ? 'is-checking' : ''}`} aria-hidden="true"><ShieldCheck size={30} /></div>
          <Dialog.Title>Ready this browser for work</Dialog.Title>
          <Dialog.Description id="permission-check-description">Allow these permissions once where your browser offers that choice. Your existing attendance checks will still run when you sign in.</Dialog.Description>
          <ol className="permission-check-stages" aria-label="Browser permission checks">
            {items.map(({ name, title, detail, Icon }) => <li key={name} data-state={busy === name ? 'checking' : states[name]}>
              <span className="permission-check-mark" aria-hidden="true">{busy === name || states[name] === 'checking' ? <LoaderCircle className="permission-check-spinner" size={20} /> : states[name] === 'granted' ? <Check size={20} /> : <Icon size={20} />}</span>
              <div className="permission-check-copy"><h3>{title}</h3><p>{detail}</p><span role="status">{busy === name ? 'Waiting for your browser' : labels[states[name]]}</span></div>
              {states[name] !== 'granted' && <Button className="permission-check-allow" size="sm" isDisabled={Boolean(busy) || ['checking', 'unsupported'].includes(states[name])} onPress={() => states[name] === 'denied' ? refresh() : allow(name)}>{states[name] === 'denied' ? 'Check again' : 'Allow'}</Button>}
            </li>)}
          </ol>
          <div className="permission-check-guidance"><strong>Choose persistent access when offered</strong><p>If you choose “Only this time”, your browser may ask again at the next punch-in or punch-out. We cannot tell that choice apart from a permanent grant.</p><p>Blocked? Open site settings beside the address bar and set Location, Camera and Notifications to Allow. Browser settings store these choices, not app cookies.</p></div>
          {permissionNames.some(name => states[name] === 'unsupported') && <p className="permission-check-error" role="alert">Use a supported browser on HTTPS or localhost with location, a camera and desktop notifications available.</p>}
          {error && <p className="permission-check-error" role="alert">{error}</p>}
          <div className="permission-check-footer"><Button className="permission-check-recheck" variant="light" isDisabled={Boolean(busy)} onPress={refresh}>Check permissions again</Button><Button className="capture-primary" isDisabled={!ready || Boolean(busy)} onPress={proceed}>Continue to sign-in</Button></div>
          <p className="permission-check-privacy" role="status">{ready ? 'Permissions ready. Opening sign-in…' : 'Camera testing stops immediately. No photo is taken or saved here.'}</p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  </>;
}
