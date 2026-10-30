const path = require("node:path"),
  fs = require("node:fs");
const root = path.resolve(__dirname, "../../..");
let esbuild;
try {
  esbuild = require("esbuild");
} catch {
  esbuild = require(
    path.join(root, ".local/preview-build/node_modules/esbuild"),
  );
}
const frontend = path.join(
  root,
  "iots-app/authentication-system/frontend/node_modules",
);
async function build() {
  const result = await esbuild.build({
    entryPoints: [path.join(__dirname, "main.tsx")],
    bundle: true,
    write: false,
    outdir: path.join(root, ".local/super-admin-workspace-build"),
    format: "iife",
    minify: true,
    jsx: "automatic",
    define: { "process.env.NODE_ENV": '"production"' },
    alias: {
      react: path.join(frontend, "react"),
      "react-dom": path.join(frontend, "react-dom"),
    },
    loader: { ".png": "dataurl", ".woff2": "dataurl" },
    legalComments: "inline",
  });
  const js = result.outputFiles
      .find((f) => f.path.endsWith(".js"))
      .text.replace(/<\/script/gi, "<\\/script"),
    css = result.outputFiles
      .find((f) => f.path.endsWith(".css"))
      .text.replace(/<\/style/gi, "<\\/style");
  const output = path.join(root, "iots-app/superadmin-workspace.html");
  fs.writeFileSync(
    output,
    `<!doctype html>\n<!-- Standalone example-data preview. Source: previews/super-admin-workspace. -->\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><title>CIRIL · Super Admin workspace</title><style>${css}</style></head><body><div id="root"></div><noscript>Enable JavaScript to open this workspace preview.</noscript><script>${js}</script></body></html>`,
  );
  console.log(
    `Built ${output} (${Math.round(fs.statSync(output).size / 1024)} KB)`,
  );
}
build().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
