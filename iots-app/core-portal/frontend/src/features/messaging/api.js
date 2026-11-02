const base = "/api/auth/messaging";
export async function messagingApi(
  path = "",
  { method = "GET", body, file, attachmentKind } = {},
) {
  const response = await fetch(base + path, {
    method,
    credentials: "same-origin",
    headers: file
      ? {
          "Content-Type": "application/octet-stream",
          "X-File-Name": encodeURIComponent(file.name),
          "X-Attachment-Kind": attachmentKind,
        }
      : body === undefined
        ? {}
        : { "Content-Type": "application/json" },
    body: file || (body === undefined ? undefined : JSON.stringify(body)),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(result.message || "Messaging is unavailable. Try again.");
  return result;
}
export async function downloadAttachment(file) {
  const response = await fetch(`${base}/attachments/${file.id}`, {
    credentials: "same-origin",
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || "File could not be downloaded.");
  }
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
