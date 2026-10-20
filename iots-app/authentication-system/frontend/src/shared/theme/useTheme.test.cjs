const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
// Exercise the browser store without adding a test-runner dependency.
const source = fs.readFileSync(require('node:path').join(__dirname, 'useTheme.js'), 'utf8').replace(/^import .*;\r?\n/, '').replace('export function', 'function');
function browser(saved, blocked = false) {
  const values = new Map(saved ? [['iots-theme', saved]] : []);
  const classes = new Set(); const events = {}; const style = {};
  const context = vm.createContext({
    localStorage: { getItem: key => { if (blocked) throw Error('blocked'); return values.get(key); }, setItem: (key, value) => { if (blocked) throw Error('blocked'); values.set(key, value); } },
    document: { documentElement: { classList: { toggle: (key, on) => on ? classes.add(key) : classes.delete(key) }, style } },
    window: { addEventListener: (event, callback) => { events[event] = callback; } },
    useSyncExternalStore: (_subscribe, snapshot) => snapshot(),
  });
  vm.runInContext(source, context);
  return { theme: () => vm.runInContext('useTheme()', context), values, classes, events, style };
}
const first = browser();
assert.equal(first.theme()[0], false);
first.theme()[1](true);
assert.equal(first.values.get('iots-theme'), 'dark');
assert.equal(first.classes.has('dark'), true);
assert.equal(first.style.colorScheme, 'dark');
const reload = browser(first.values.get('iots-theme'));
assert.equal(reload.theme()[0], true);
reload.values.set('iots-theme', 'light'); reload.events.storage({ key: 'iots-theme' });
assert.equal(reload.theme()[0], false);
reload.theme()[1](current => !current); assert.equal(reload.theme()[0], true);
reload.values.clear(); reload.events.storage({ key: null }); assert.equal(reload.theme()[0], false);
const restricted = browser(null, true);
restricted.theme()[1](true); assert.equal(restricted.theme()[0], true);
console.log('PASS: shared theme persistence, reload, cross-tab updates, storage clearing and blocked storage.');
