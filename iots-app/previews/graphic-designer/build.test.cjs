const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const previewDirectory = path.resolve(__dirname, "..");
const html = fs.readFileSync(
  path.join(previewDirectory, "graphic-designer.html"),
  "utf8",
);
assert.ok(html.split("\n").length < 40, "HTML should remain a readable mount document.");
assert.ok(!html.includes("base64,"), "Embedded vendor assets belong in dist.");
for (const [, relativePath] of html.matchAll(
  /(?:src|href)="(\.\/graphic-designer\/dist\/[^\"]+)"/g,
)) {
  assert.ok(fs.existsSync(path.resolve(previewDirectory, relativePath)), relativePath);
}
const bundle = fs.readFileSync(path.join(__dirname, "dist/workspace.js"), "utf8");
assert.ok(
  bundle.includes("workspace.js.LEGAL.txt"),
  "Required legal notices must remain linked.",
);
assert.ok(fs.statSync(path.join(__dirname, "dist/workspace.js.LEGAL.txt")).size > 0);
assert.ok(fs.existsSync(path.join(__dirname, "dist/workspace.js.map")));
assert.ok(fs.existsSync(path.join(__dirname, "dist/assets/noto-sans-latin.woff2")));
console.log("PASS readable HTML, local assets, source map and preserved legal notices.");
