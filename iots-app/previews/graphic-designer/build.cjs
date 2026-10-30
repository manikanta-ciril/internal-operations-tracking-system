const { buildPreview } = require("./build-preview.cjs");

buildPreview({
  entryPoint: "main.jsx",
  stylesheet: "style.css",
  bundleName: "workspace",
  template: "preview.html",
  htmlFile: "graphic-designer.html",
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
