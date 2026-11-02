import companyLogo from "../../assets/logo.png";
export const reportSections = [
  "Tasks to be done",
  "Tasks completed",
  "Tasks in progress",
  "Tasks pending",
  "New tasks",
];
export const emptySectionMessages = [
  "No tasks selected for this day.",
  "No tasks completed.",
  "No tasks in progress.",
  "No pending tasks reported.",
  "No new tasks taken up.",
];
export function reportGroups(report) {
  const entries = Object.entries(report.entries || {});
  return [
    entries,
    entries.filter(([, e]) => e.section === reportSections[1]),
    entries.filter(
      ([, e]) =>
        e.section !== reportSections[1] && e.section !== reportSections[3],
    ),
    entries.filter(([, e]) => e.section === reportSections[3]),
    entries.filter(([, e]) => e.newToday),
  ];
}
export const reportColumns = [
  "Task ID",
  "Date",
  "Day",
  "Tasks to be done",
  "Task Completed",
  "Tasks in Progress",
  "Tasks pending",
  "Any new tasks assigned or taken up during the day",
  "Remarks",
  "Evidence",
];
export function reportRows(report) {
  const day = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    timeZone: "Asia/Kolkata",
  }).format(new Date(report.date + "T12:00:00+05:30"));
  const rows = Object.entries(report.entries || {}).map(([id, e]) => {
    const result = e.note?.trim() || e.title;
    return [
      id,
      report.date,
      day,
      e.title,
      e.section === reportSections[1] ? result : "--",
      e.section !== reportSections[1] && e.section !== reportSections[3]
        ? result
        : "--",
      e.section === reportSections[3] ? result : "--",
      e.newToday ? result : "--",
      e.remarks || "--",
      (e.proofs || []).map((p) => p.name).join("; ") || "--",
    ];
  });
  if (report.other?.trim() || report.proofs?.length)
    rows.push([
      "--",
      report.date,
      day,
      "Other work",
      "--",
      report.other || "--",
      "--",
      "--",
      "--",
      (report.proofs || []).map((p) => p.name).join("; ") || "--",
    ]);
  return rows;
}
export function employeeIdentity(employee) {
  return `${employee.name} | Employee ID: ${employee.employeeId || employee.id || "Not provided"} | ${employee.role || "Role not provided"} | ${employee.email || "Email not provided"}`;
}
export function reportSummary(report) {
  return reportGroups(report)
    .map((entries, i) =>
      !entries.length
        ? report.emptyMessages?.[i] || emptySectionMessages[i]
        : "",
    )
    .filter(Boolean)
    .concat(report.remarks ? ["Daily remarks: " + report.remarks] : []);
}
function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const safe = (value) =>
  /^[=+@-]/.test(String(value).trimStart()) ? "'" + value : String(value);
async function reportLogo() {
  const response = await fetch(companyLogo);
  if (!response.ok)
    throw new Error("The company logo could not be loaded. Retry the export.");
  const bytes = new Uint8Array(await response.arrayBuffer());
  return (
    "data:image/png;base64," +
    btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""))
  );
}
export async function exportManualReport(format, report, employee) {
  const logo = format === "csv" ? null : await reportLogo();
  const rows = reportRows(report),
    name = `ciril-report-${report.date}`,
    identity = employeeIdentity(employee),
    summary = reportSummary(report);
  if (format === "csv") {
    // CSV is text-only; the logo is identified by filename instead of an embedded image.
    const data = [
      [
        "CIRIL Daily Task Report",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "Company logo",
        "logo.png",
      ],
      [
        "Employee",
        employee.name,
        "Employee ID",
        employee.employeeId || employee.id || "Not provided",
        "Role",
        employee.role || "Not provided",
        "Email",
        employee.email || "Not provided",
      ],
      ["Report date", report.date],
      ["Recipient", "General Manager / Senior Manager / Executive"],
      [],
      reportColumns,
      ...rows,
      [],
      ...summary.map((text) => ["Summary", text]),
    ];
    saveBlob(
      new Blob(
        [
          "\ufeff" +
            data
              .map((row) =>
                row
                  .map((v) => '"' + safe(v).replaceAll('"', '""') + '"')
                  .join(","),
              )
              .join("\r\n"),
        ],
        { type: "text/csv;charset=utf-8" },
      ),
      name + ".csv",
    );
  } else if (format === "xlsx") {
    const { default: ExcelJS } = await import("exceljs");
    const book = new ExcelJS.Workbook();
    book.creator = "CIRIL IOTS";
    const sheet = book.addWorksheet("Daily report", {
      pageSetup: {
        paperSize: 9,
        orientation: "landscape",
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
      },
      views: [{ state: "frozen", ySplit: 6 }],
    });
    sheet.mergeCells("A1:H1");
    sheet.getCell("A1").value = "CIRIL Daily Task Report";
    sheet.getCell("A1").font = {
      bold: true,
      size: 18,
      color: { argb: "FF805D2C" },
    };
    sheet.mergeCells("A2:H2");
    sheet.getCell("A2").value = identity;
    sheet.mergeCells("A3:H3");
    sheet.getCell("A3").value = "Report date: " + report.date;
    sheet.mergeCells("A4:H4");
    sheet.getCell("A4").value =
      "Recipient: General Manager / Senior Manager / Executive";
    const image = book.addImage({ base64: logo, extension: "png" });
    sheet.mergeCells("I1:J4");
    sheet.addImage(image, {
      tl: { col: 8.66, row: 1.2 },
      ext: { width: 150, height: 61 },
      editAs: "oneCell",
    });
    sheet.getRow(6).values = reportColumns;
    rows.forEach((row) => sheet.addRow(row));
    sheet.addRow([]);
    summary.forEach((text) => {
      const n = sheet.addRow([text]).number;
      sheet.mergeCells(n, 1, n, 10);
    });
    sheet.columns.forEach(
      (column, i) =>
        (column.width = [16, 14, 15, 35, 38, 38, 35, 40, 32, 32][i]),
    );
    sheet.eachRow((row) => {
      row.alignment = {
        vertical: "middle",
        horizontal: "left",
        indent: 1,
        wrapText: true,
      };
      row.font = { name: "Calibri", size: 11, color: { argb: "FF292D35" } };
      row.height = Math.max(
        26,
        Math.min(
          400,
          (Math.max(
            ...row.values.filter((v) => v != null).map((v) => String(v).length),
          ) /
            30) *
            15 +
            18,
        ),
      );
    });
    for (let n = 1; n <= 4; n++) {
      sheet.getRow(n).height = n === 2 ? 34 : 26;
      sheet.getCell(n, 1).alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
    }
    sheet.getCell("A1").font = {
      bold: true,
      size: 18,
      color: { argb: "FF805D2C" },
    };
    sheet.getRow(6).height = 52;
    sheet.getRow(6).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FF292D35" } };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF2EBDD" },
      };
      cell.border = { bottom: { style: "thin", color: { argb: "FFB99659" } } };
    });
    sheet.autoFilter = {
      from: { row: 6, column: 1 },
      to: { row: 6 + rows.length, column: 10 },
    };
    sheet.pageSetup.printTitlesRow = "1:6";
    saveBlob(
      new Blob([await book.xlsx.writeBuffer()], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      name + ".xlsx",
    );
  } else {
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
    const widths = [18, 22, 20, 32, 34, 34, 30, 35, 26, 26];
    let y = 0,
      page = 0;
    const lineHeight = 3.7;
    const header = () => {
      page++;
      pdf.setTextColor(36, 43, 48);
      pdf.setFontSize(14);
      pdf.setTextColor(128, 93, 44);
      pdf.text("CIRIL Daily Task Report", 130, 13, { align: "center" });
      pdf.setTextColor(41, 45, 53);
      pdf.addImage(companyLogo, "PNG", 253, 6, 32, 13);
      pdf.setFontSize(8);
      const info = pdf.splitTextToSize(identity, 235);
      pdf.text(info, 130, 22, { align: "center" });
      pdf.text(
        "Report date: " +
          report.date +
          " | Recipient: General Manager / Senior Manager / Executive",
        130,
        24 + info.length * 4,
        { align: "center" },
      );
      y = 34 + info.length * 4;
      pdf.setFontSize(7);
      let x = 10;
      for (let i = 0; i < widths.length; i++) {
        pdf.setFillColor(242, 235, 221);
        pdf.rect(x, y, widths[i], 20, "F");
        const title = pdf.splitTextToSize(reportColumns[i], widths[i] - 6);
        pdf.text(
          title,
          x + widths[i] / 2,
          y + (20 - (title.length - 1) * lineHeight) / 2,
          { align: "center" },
        );
        x += widths[i];
      }
      y += 20;
      pdf.setFontSize(7);
      pdf.text("Page " + page, 270, 204);
    };
    header();
    for (const row of rows) {
      const lines = row.map((v, i) =>
        pdf.splitTextToSize(String(v), widths[i] - 6),
      );
      let offset = 0;
      const total = Math.max(...lines.map((l) => l.length));
      while (offset < total) {
        if (y > 188) {
          pdf.addPage();
          header();
        }
        const count = Math.min(
          total - offset,
          Math.max(1, Math.floor((195 - y - 4) / lineHeight)),
        );
        const height = count * lineHeight + 4;
        let x = 10;
        for (let i = 0; i < widths.length; i++) {
          pdf.setDrawColor(210, 210, 205);
          pdf.rect(x, y, widths[i], height);
          const chunk = lines[i].slice(offset, offset + count);
          if (chunk.length)
            pdf.text(
              chunk,
              x + 3,
              y + (height - (chunk.length - 1) * lineHeight) / 2,
            );
          x += widths[i];
        }
        offset += count;
        y += height;
      }
    }
    for (const text of summary) {
      for (const line of pdf.splitTextToSize(text, 270)) {
        if (y > 190) {
          pdf.addPage();
          header();
        }
        pdf.text(line, 10, y + 5);
        y += 5;
      }
    }
    pdf.save(name + ".pdf");
  }
}
// Proof blobs live in IndexedDB; report state stores only references and metadata.
async function proofStore(mode, action) {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open("ciril-report-evidence", 1);
    open.onupgradeneeded = () => open.result.createObjectStore("proofs");
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result;
      const tx = db.transaction("proofs", mode);
      const request = action(tx.objectStore("proofs"));
      tx.oncomplete = () => {
        resolve(request.result);
        db.close();
      };
      tx.onerror = () => {
        reject(tx.error);
        db.close();
      };
    };
  });
}
export async function storeProof(file) {
  if (file.size > 25 * 1024 * 1024) throw Error("Choose a proof under 25 MB.");
  const id = crypto.randomUUID();
  await proofStore("readwrite", (s) => s.put(file, id));
  return { id, name: file.name, type: file.type, size: file.size };
}
export async function downloadProof(proof) {
  const blob = await proofStore("readonly", (s) => s.get(proof.id));
  if (!blob) throw Error("This proof is not available on this device.");
  saveBlob(blob, proof.name);
}
