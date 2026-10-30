// Dedicated zero-dependency HTTP server for IOTS Graphic Designer preview
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_PORT = 8080;
const port = parseInt(process.env.PORT || process.argv[2] || String(DEFAULT_PORT), 10);
const baseDir = __dirname;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

const server = http.createServer((req, res) => {
  // CORS & Development headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  let reqPath = decodeURIComponent(req.url.split("?")[0]);
  if (reqPath === "/" || reqPath === "") {
    reqPath = "/graphic-designer.html";
  }

  const safePath = path.normalize(path.join(baseDir, reqPath));

  // Security: prevent path traversal outside baseDir
  if (!safePath.startsWith(baseDir)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("403 Forbidden");
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end(`404 Not Found: ${reqPath}`);
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": stats.size,
    });

    const stream = fs.createReadStream(safePath);
    stream.pipe(res);
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`[IOTS Preview Server] running on:`);
  console.log(`  - Local:    http://localhost:${port}/`);
  console.log(`  - Network:  http://0.0.0.0:${port}/`);
  console.log(`  - Serving:  ${path.join(baseDir, "graphic-designer.html")}`);
});
