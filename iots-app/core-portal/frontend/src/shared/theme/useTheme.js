import { useSyncExternalStore } from 'react';

const key = 'iots-theme';
const listeners = new Set();
function readSavedTheme() {
  try { return localStorage.getItem(key) === 'dark'; } catch { return false; }
}
let dark = readSavedTheme();
function applyTheme() {
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
}
applyTheme();
function notify() { listeners.forEach(listener => listener()); }
window.addEventListener('storage', event => {
  if (event.key !== key && event.key !== null) return;
  dark = readSavedTheme(); applyTheme(); notify();
});
function setDark(value) {
  dark = typeof value === 'function' ? Boolean(value(dark)) : Boolean(value);
  applyTheme();
  try { localStorage.setItem(key, dark ? 'dark' : 'light'); } catch { /* Keep the theme usable when storage is blocked. */ }
  notify();
}
function subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }
export function useTheme() {
  return [useSyncExternalStore(subscribe, () => dark), setDark];
}
