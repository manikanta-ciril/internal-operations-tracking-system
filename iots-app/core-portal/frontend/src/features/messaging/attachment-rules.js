export const maxAttachmentBytes = 30 * 1024 * 1024;
export const imageExtensions = ["png", "jpg", "jpeg", "webp", "gif"];
export const documentExtensions = [
  "pdf",
  "txt",
  "csv",
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
  "md",
];
export const imageAccept = imageExtensions
  .map((extension) => `.${extension}`)
  .join(",");
export const documentAccept = documentExtensions
  .map((extension) => `.${extension}`)
  .join(",");
export function validateChatFiles(files, kind) {
  const extensions = kind === "images" ? imageExtensions : documentExtensions;
  for (const file of files) {
    if (!file.size || file.size > maxAttachmentBytes)
      throw new Error(`${file.name}: choose a nonempty file up to 30 MB.`);
    if (!extensions.includes(file.name.split(".").pop().toLowerCase()))
      throw new Error(
        `${file.name}: choose ${kind === "images" ? "a PNG, JPG, JPEG, WebP or GIF image" : "a supported document"} (${extensions.join(", ")}).`,
      );
  }
}

export const maxFilesPerMessage = 10;
export const allAllowedExtensions = [
  ...imageExtensions,
  ...documentExtensions,
];
export const allAccept = allAllowedExtensions
  .map((extension) => `.${extension}`)
  .join(",");

export function getFileExtension(filename = "") {
  if (typeof filename !== "string") return "";
  const lastDot = filename.lastIndexOf(".");
  if (lastDot <= 0 || lastDot === filename.length - 1) return "";
  return filename.slice(lastDot + 1).toLowerCase();
}

export function isImageFile(fileOrName) {
  const name =
    typeof fileOrName === "string" ? fileOrName : fileOrName?.name || "";
  const ext = getFileExtension(name);
  return ext !== "" && imageExtensions.includes(ext);
}

export function isDocumentFile(fileOrName) {
  const name =
    typeof fileOrName === "string" ? fileOrName : fileOrName?.name || "";
  const ext = getFileExtension(name);
  return ext !== "" && documentExtensions.includes(ext);
}

export function classifyChatFile(fileOrName) {
  if (isImageFile(fileOrName)) return "images";
  if (isDocumentFile(fileOrName)) return "documents";
  return null;
}

export function validateDroppedFiles(files, currentFilesCount = 0) {
  if (!files || !files.length) return { images: [], documents: [] };
  const safeCount = Math.max(0, Number(currentFilesCount) || 0);
  if (safeCount + files.length > maxFilesPerMessage)
    throw new Error(`Attach at most ${maxFilesPerMessage} files per message.`);
  const images = [];
  const documents = [];
  for (const file of files) {
    if (
      !file ||
      typeof file.size !== "number" ||
      !Number.isFinite(file.size) ||
      file.size <= 0 ||
      file.size > maxAttachmentBytes
    ) {
      const displayName = file?.name || "File";
      throw new Error(`${displayName}: choose a nonempty file up to 30 MB.`);
    }
    const kind = classifyChatFile(file);
    if (!kind) {
      const displayName = file.name || "File";
      throw new Error(
        `${displayName}: choose a supported image or document (${imageExtensions.join(", ")}, ${documentExtensions.join(", ")}).`,
      );
    }
    if (kind === "images") images.push(file);
    else documents.push(file);
  }
  return { images, documents };
}

let dragDropEnabledState = true;

export function isDragDropEnabled() {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const stored = window.localStorage.getItem("iots:drag-drop-enabled");
      if (stored !== null) return stored === "true";
    } catch {
      // LocalStorage access restricted in private mode
    }
  }
  return dragDropEnabledState;
}

export function setDragDropEnabled(enabled) {
  dragDropEnabledState = Boolean(enabled);
  if (typeof window !== "undefined") {
    try {
      if (window.localStorage) {
        window.localStorage.setItem(
          "iots:drag-drop-enabled",
          String(dragDropEnabledState),
        );
      }
      window.dispatchEvent(
        new CustomEvent("iots:drag-drop-toggle", {
          detail: { enabled: dragDropEnabledState },
        }),
      );
    } catch {
      // ignore
    }
  }
  return dragDropEnabledState;
}

export const dragDropAttachmentRules = {
  maxAttachmentBytes,
  maxFilesPerMessage,
  imageExtensions,
  documentExtensions,
  allAllowedExtensions,
  allAccept,
  isDragDropEnabled,
  setDragDropEnabled,
  closeLabel: "Close file sharing",
  cancelLabel: "Cancel drag and drop",
  disableLabel: "Disable drag-and-drop file sharing",
  summary:
    "Images (PNG, JPG, JPEG, WebP, GIF) & Documents (PDF, Word, Excel, etc.) · Max 30 MB each · Up to 10 files",
};


