const path = require("node:path");
const fs = require("node:fs");
const root = path.resolve(__dirname, "../../..");
let esbuild;
try {
  esbuild = require("esbuild");
} catch {
  esbuild = require(
    path.join(root, ".local/preview-build/node_modules/esbuild"),
  );
}
const frontend = path.join(root, "iots-app/authentication-system/frontend");
async function build() {
  const result = await esbuild.build({
    entryPoints: [path.join(__dirname, "main.jsx")],
    bundle: true,
    write: false,
    outdir: path.join(root, ".local/super-admin-build"),
    format: "iife",
    minify: true,
    jsx: "automatic",
    define: { "process.env.NODE_ENV": '"production"' },
    alias: {
      react: path.join(frontend, "node_modules/react"),
      "react-dom": path.join(frontend, "node_modules/react-dom"),
    },
    loader: { ".png": "dataurl", ".woff2": "dataurl" },
    legalComments: "inline",
  });
  const script = result.outputFiles
    .find((f) => f.path.endsWith(".js"))
    .text.replace(/<\/script/gi, "<\\/script");
  const style = result.outputFiles
    .find((f) => f.path.endsWith(".css"))
    .text.replace(/<\/style/gi, "<\\/style");
  const html = `<!doctype html>\n<!-- Built from previews/super-admin/main.jsx. Local draft preview; no live API connections. -->\n<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><title>CIRIL · Company setup</title><style>${style}</style></head><body><div id="root"></div><noscript>Enable JavaScript to open the company setup preview.</noscript><script>${script}</script></body></html>\n`;
  const output = path.join(root, "iots-app/superadmin.html");
  fs.writeFileSync(output, html);
  console.log(
    `Built ${output} (${Math.round(Buffer.byteLength(html) / 1024)} KB)`,
  );
}
build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
