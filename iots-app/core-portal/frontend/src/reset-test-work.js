// One-time, authorized test-data reset. Keep a recovery copy on each browser.
const resetId = '2026-10-31-all-test-work';

export function resetTestWorkOnce(storage = globalThis.localStorage) {
  const marker = 'ciril-iots-work-reset';
  if (storage.getItem(marker) === resetId) return;
  const keys = Object.keys(storage).filter(
    (key) => key === 'ciril-iots-tasks-v1' || key.startsWith('ciril-iots-tasks-v1:'),
  );
  const backup = Object.fromEntries(keys.map((key) => [key, storage.getItem(key)]));
  if (keys.length) storage.setItem(`ciril-iots-work-backup:${resetId}`, JSON.stringify(backup));
  keys.forEach((key) => storage.removeItem(key));
  storage.setItem(marker, resetId);
}
