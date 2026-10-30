const path = require("node:path");
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const esbuild = require("esbuild");

const previewDirectory = path.resolve(__dirname, "..");
const outputDirectory = path.join(__dirname, "dist");
const fontSource = path.resolve(
  __dirname,
  "../../authentication-system/frontend/src/assets/fonts/noto-sans-latin.woff2",
);

function buildStyles({ stylesheet, bundleName }) {
  const cssOutput = path.join(outputDirectory, `${bundleName}.css`);
  execFileSync(
    process.execPath,
    [
      path.join(__dirname, "node_modules/@tailwindcss/cli/dist/index.mjs"),
      "-i",
      path.join(__dirname, stylesheet),
      "-o",
      cssOutput,
    ],
    { cwd: __dirname, stdio: "inherit" },
  );
  const fontStyles =
    '@font-face { font-family: "CIRIL Noto"; src: url("./assets/noto-sans-latin.woff2") format("woff2"); font-style: normal; font-weight: 100 900; font-display: swap; }\n';
  fs.writeFileSync(cssOutput, fontStyles + fs.readFileSync(cssOutput, "utf8"));
}

function buildScripts({ entryPoint, bundleName }) {
  return esbuild.build({
    entryPoints: [path.join(__dirname, entryPoint)],
    outfile: path.join(outputDirectory, `${bundleName}.js`),
    bundle: true,
    format: "iife",
    minify: false,
    sourcemap: true,
    jsx: "automatic",
    define: { "process.env.NODE_ENV": '"production"' },
    alias: { "@": __dirname },
    loader: { ".png": "file", ".svg": "file", ".webp": "file" },
    assetNames: "assets/[name]-[hash]",
    publicPath: "./graphic-designer/dist",
    legalComments: "linked",
  });
}

async function buildPreview(configuration) {
  fs.mkdirSync(path.join(outputDirectory, "assets"), { recursive: true });
  fs.copyFileSync(fontSource, path.join(outputDirectory, "assets/noto-sans-latin.woff2"));
  buildStyles(configuration);
  await buildScripts(configuration);
  const htmlOutput = path.join(previewDirectory, configuration.htmlFile);
  fs.copyFileSync(path.join(__dirname, configuration.template), htmlOutput);
  console.log(`Built ${htmlOutput}`);
}

module.exports = { buildPreview };
