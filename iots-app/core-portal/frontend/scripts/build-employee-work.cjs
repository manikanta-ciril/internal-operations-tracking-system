const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const postcss = require('postcss');
const frontend = path.resolve(__dirname, '..');
const styles = path.join(frontend, 'src/features/creative-associate/workspace/styles');
const compiled = path.join(styles, 'compiled.css');
execFileSync(process.execPath, [path.join(frontend, 'node_modules/@tailwindcss/cli/dist/index.mjs'), '-i', path.join(styles, 'source.css'), '-o', compiled], { cwd: frontend, stdio: 'inherit' });
const stylesheet = postcss.parse(fs.readFileSync(compiled, 'utf8'));
stylesheet.walkAtRules('layer', layer => { layer.params = layer.params.split(',').map(name => 'employee-work-' + name.trim()).join(', '); });
stylesheet.walkRules(rule => {
  let ancestor = rule.parent;
  while (ancestor) { if (ancestor.type === 'rule' || ancestor.name?.includes('keyframes')) return; ancestor = ancestor.parent; }
  rule.selectors = rule.selectors.map(selector => {
    if ([':root', ':host', 'body'].includes(selector)) return 'body.ciril-employee-work';
    if (selector === '.dark') return '.dark body.ciril-employee-work';
    if (selector === 'html') return 'html:has(body.ciril-employee-work)';
    return ':where(body.ciril-employee-work) ' + selector.replace(/\.workspace-header\b/g, '.preview-unused-header');
  });
});
stylesheet.prepend('@font-face { font-family: "CIRIL Noto"; src: url("../../../../assets/fonts/noto-sans-latin.woff2") format("woff2"); font-weight: 100 900; font-display: swap; }');
fs.writeFileSync(path.join(styles, 'workspace.css'), stylesheet.toString());
fs.unlinkSync(compiled);
