const fs = require("node:fs/promises");
const path = require("node:path");
const { randomUUID, createHash } = require("node:crypto");
const { requireThat } = require("./policy");
const storageRoot = path.resolve(
  process.env.IOTS_TASK_ROOT ||
    path.join(require("../config/paths").local, "task-evidence"),
);
const allowed = new Set([
  "txt",
  "csv",
  "md",
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "webp",
  "gif",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "odt",
  "ods",
  "odp",
  "rtf",
  "psd",
  "ai",
  "fig",
  "eps",
  "indd",
  "zip",
  "svg",
  "mp4",
  "mov",
  "mp3",
  "wav",
]);
async function prepare(nameHeader, buffer) {
  let name;
  try {
    name = decodeURIComponent(nameHeader || "");
  } catch {
    requireThat(false, "Choose a valid filename.");
  }
  requireThat(
    typeof name === "string" &&
      name.length > 0 &&
      name.length <= 180 &&
      !/[\x00-\x1f\x7f/\\]/.test(name),
    "Choose a simple filename without folders.",
  );
  const extension = name.split(".").at(-1).toLowerCase();
  requireThat(
    allowed.has(extension),
    "Choose a supported image, document or creative source file.",
  );
  requireThat(
    Buffer.isBuffer(buffer) &&
      buffer.length > 0 &&
      buffer.length <= 30 * 1024 * 1024,
    "Choose a nonempty file up to 30 MB.",
  );
  let type = "application/octet-stream";
  if (/^(png|jpe?g|gif|webp)$/.test(extension))
    type = await require("../messaging/images").imageMediaType(name, buffer);
  const signature = {
    pdf: "%PDF-",
    docx: "PK",
    xlsx: "PK",
    pptx: "PK",
    odt: "PK",
    ods: "PK",
    odp: "PK",
    zip: "PK",
    psd: "8BPS",
    doc: "\xd0\xcf\x11\xe0",
    xls: "\xd0\xcf\x11\xe0",
    ppt: "\xd0\xcf\x11\xe0",
    rtf: "{\\rtf",
    eps: "%!PS",
    wav: "RIFF",
  }[extension];
  if (signature)
    requireThat(
      buffer
        .subarray(0, signature.length)
        .equals(Buffer.from(signature, "latin1")),
      "The file content does not match its format.",
    );
  if (["txt", "csv", "md"].includes(extension)) {
    requireThat(!buffer.includes(0), "Choose a plain text document.");
    type = "text/plain";
  }
  if (extension === "pdf") type = "application/pdf";
  if (extension === "wav")
    requireThat(
      buffer.subarray(8, 12).toString() === "WAVE",
      "Choose a valid WAV audio file.",
    );
  if (extension === "mp4")
    requireThat(
      buffer.subarray(4, 8).toString() === "ftyp",
      "Choose a valid MP4 video file.",
    );
  if (extension === "mov")
    requireThat(
      ["ftyp", "moov", "mdat", "wide"].includes(
        buffer.subarray(4, 8).toString(),
      ),
      "Choose a valid MOV video file.",
    );
  if (extension === "mp3")
    requireThat(
      buffer.subarray(0, 3).toString() === "ID3" ||
        (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0),
      "Choose a valid MP3 audio file.",
    );
  if (extension === "svg")
    requireThat(
      /<svg[\s>]/i.test(buffer.subarray(0, 8192).toString("utf8")),
      "Choose a valid SVG source file.",
    );
  return {
    id: randomUUID(),
    name,
    type: type || "application/octet-stream",
    size: buffer.length,
    sha256: createHash("sha256").update(buffer).digest("hex"),
    server: true,
  };
}
async function write(file, bytes) {
  await fs.mkdir(storageRoot, { recursive: true });
  await fs.writeFile(path.join(storageRoot, file.id), bytes, {
    flag: "wx",
    mode: 0o600,
  });
}
async function remove(id) {
  await fs.unlink(path.join(storageRoot, id)).catch(() => {});
}
function previewType(name) {
  const types = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', pdf: 'application/pdf', txt: 'text/plain; charset=utf-8', csv: 'text/plain; charset=utf-8', md: 'text/plain; charset=utf-8', mp4: 'video/mp4', mov: 'video/quicktime', mp3: 'audio/mpeg', wav: 'audio/wav' };
  return types[String(name).split('.').at(-1).toLowerCase()] || null;
}
module.exports = { prepare, write, remove, storageRoot, previewType };
