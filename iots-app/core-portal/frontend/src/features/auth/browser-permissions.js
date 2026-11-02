export const permissionNames = ['geolocation', 'camera', 'notifications'];

export async function readPermission(name) {
  if (!globalThis.isSecureContext) return 'unsupported';
  if (name === 'notifications') return typeof Notification === 'undefined' ? 'unsupported' : Notification.permission === 'default' ? 'prompt' : Notification.permission;
  if (name === 'geolocation' && !navigator.geolocation) return 'unsupported';
  if (name === 'camera' && !navigator.mediaDevices?.getUserMedia) return 'unsupported';
  try { return (await navigator.permissions.query({ name })).state; }
  catch { return null; }
}

export async function requestPermission(name) {
  if (name === 'notifications') {
    const state = await Notification.requestPermission();
    if (state !== 'granted') throw new Error('Notifications are not allowed. Set Notifications to Allow in browser site settings.');
  } else if (name === 'camera') {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    stream.getTracks().forEach(track => track.stop());
  } else {
    await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }));
  }
}
