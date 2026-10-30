const { buildPreview } = require("./build-preview.cjs");

buildPreview({
  entryPoint: "designer-preview-main.jsx",
  stylesheet: "designer-preview.css",
  bundleName: "designer-concept",
  template: "designer-preview.html",
  htmlFile: "designer-workspace.html",
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
