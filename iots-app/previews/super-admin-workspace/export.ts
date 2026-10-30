import type { ExportFormat } from "./types";
const encode = new TextEncoder();
const bytes = (s: string) => encode.encode(s);
const join = (parts: Uint8Array[]) => {
  const result = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let i = 0;
  for (const p of parts) {
    result.set(p, i);
    i += p.length;
  }
  return result;
};
const xml = (s: unknown) =>
  String(s ?? "").replace(
    /[<>&"']/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );
function crc32(data: Uint8Array) {
  let crc = -1;
  for (const b of data) {
    crc ^= b;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ -1) >>> 0;
}
function zip(files: Record<string, string>) {
  const parts: Uint8Array[] = [],
    central: Uint8Array[] = [];
  let offset = 0;
  for (const [name, text] of Object.entries(files)) {
    const n = bytes(name),
      d = bytes(text),
      crc = crc32(d),
      head = new Uint8Array(30),
      h = new DataView(head.buffer);
    h.setUint32(0, 0x04034b50, true);
    h.setUint16(4, 20, true);
    h.setUint32(14, crc, true);
    h.setUint32(18, d.length, true);
    h.setUint32(22, d.length, true);
    h.setUint16(26, n.length, true);
    parts.push(head, n, d);
    const item = new Uint8Array(46),
      v = new DataView(item.buffer);
    v.setUint32(0, 0x02014b50, true);
    v.setUint16(4, 20, true);
    v.setUint16(6, 20, true);
    v.setUint32(16, crc, true);
    v.setUint32(20, d.length, true);
    v.setUint32(24, d.length, true);
    v.setUint16(28, n.length, true);
    v.setUint32(42, offset, true);
    central.push(item, n);
    offset += head.length + n.length + d.length;
  }
  const c = join(central),
    end = new Uint8Array(22),
    v = new DataView(end.buffer);
  v.setUint32(0, 0x06054b50, true);
  v.setUint16(8, Object.keys(files).length, true);
  v.setUint16(10, Object.keys(files).length, true);
  v.setUint32(12, c.length, true);
  v.setUint32(16, offset, true);
  return join([...parts, c, end]);
}
async function pdf(title: string, headers: string[], rows: string[][]) {
  const pages: string[][] = [];
  let lines: string[] = [];
  for (const row of rows) {
    headers.forEach((h, i) => {
      const text = `${h}: ${row[i] || "—"}`;
      for (let n = 0; n < text.length; n += 86) {
        if (lines.length >= 38) {
          pages.push(lines);
          lines = [];
        }
        lines.push(text.slice(n, n + 86));
      }
    });
    lines.push("");
  }
  if (lines.length || !pages.length)
    pages.push(lines.length ? lines : ["No records in this view."]);
  const objects: Uint8Array[] = [
    bytes("<< /Type /Catalog /Pages 2 0 R >>"),
    new Uint8Array(),
  ];
  const kids: number[] = [];
  for (let i = 0; i < pages.length; i++) {
    const canvas = document.createElement("canvas");
    canvas.width = 1240;
    canvas.height = 1754;
    const ctx = canvas.getContext("2d")!;
    const printStyle = getComputedStyle(
      document.querySelector(".gw") || document.documentElement,
    );
    ctx.fillStyle = printStyle.getPropertyValue("--gw-print-paper").trim();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = printStyle.getPropertyValue("--gw-print-ink").trim();
    ctx.font = '600 30px "Workspace Noto", sans-serif';
    ctx.fillText(`CIRIL · ${title}`, 70, 85);
    ctx.font = '18px "Workspace Noto", sans-serif';
    ctx.fillText("Example data · Exported current filtered view", 70, 125);
    ctx.font = '21px "Workspace Noto", sans-serif';
    pages[i].forEach((line, n) => ctx.fillText(line, 70, 185 + n * 37));
    ctx.font = "17px sans-serif";
    ctx.fillText(`Page ${i + 1} / ${pages.length}`, 70, 1685);
    const raw = atob(canvas.toDataURL("image/jpeg", 0.9).split(",")[1]),
      image = Uint8Array.from(raw, (c) => c.charCodeAt(0));
    const page = objects.length + 1,
      img = page + 1,
      content = page + 2;
    kids.push(page);
    const draw = bytes("q 595 0 0 842 0 0 cm /Image Do Q");
    objects.push(
      bytes(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Image ${img} 0 R >> >> /Contents ${content} 0 R >>`,
      ),
      join([
        bytes(
          `<< /Type /XObject /Subtype /Image /Width 1240 /Height 1754 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.length} >>\nstream\n`,
        ),
        image,
        bytes("\nendstream"),
      ]),
      join([
        bytes(`<< /Length ${draw.length} >>\nstream\n`),
        draw,
        bytes("\nendstream"),
      ]),
    );
  }
  objects[1] = bytes(
    `<< /Type /Pages /Kids [${kids.map((k) => `${k} 0 R`).join(" ")}] /Count ${kids.length} >>`,
  );
  const chunks = [bytes("%PDF-1.4\n")],
    offsets = [0];
  let position = chunks[0].length;
  objects.forEach((o, i) => {
    offsets.push(position);
    const item = join([bytes(`${i + 1} 0 obj\n`), o, bytes("\nendobj\n")]);
    chunks.push(item);
    position += item.length;
  });
  chunks.push(
    bytes(
      `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets
        .slice(1)
        .map((o) => `${String(o).padStart(10, "0")} 00000 n \n`)
        .join(
          "",
        )}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${position}\n%%EOF`,
    ),
  );
  return new Blob([join(chunks) as BlobPart], { type: "application/pdf" });
}
export async function makeExport(
  format: ExportFormat,
  title: string,
  records: Record<string, unknown>[],
) {
  const headers = [...new Set(records.flatMap((r) => Object.keys(r)))];
  const rows = records.map((r) =>
    headers.map((h) =>
      typeof r[h] === "object" ? JSON.stringify(r[h]) : String(r[h] ?? ""),
    ),
  );
  if (format === "PDF") return pdf(title, headers, rows);
  if (format === "CSV") {
    const cell = (s: string) =>
      `"${(/^\s*[=+\-@\t\r]/.test(s) ? "'" : "") + s.replace(/"/g, '""')}"`;
    return new Blob(
      [
        "\ufeff",
        [headers, ...rows].map((row) => row.map(cell).join(",")).join("\r\n"),
      ],
      { type: "text/csv;charset=utf-8" },
    );
  }
  const sheet = `<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${[headers, ...rows].map((row, i) => `<row r="${i + 1}">${row.map((value) => `<c t="inlineStr"><is><t xml:space="preserve">${xml(value)}</t></is></c>`).join("")}</row>`).join("")}</sheetData></worksheet>`;
  return new Blob(
    [
      zip({
        "[Content_Types].xml":
          '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
        "_rels/.rels":
          '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
        "xl/workbook.xml":
          '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Current view" sheetId="1" r:id="rId1"/></sheets></workbook>',
        "xl/_rels/workbook.xml.rels":
          '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
        "xl/worksheets/sheet1.xml": sheet,
      }) as BlobPart,
    ],
    {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  );
}
