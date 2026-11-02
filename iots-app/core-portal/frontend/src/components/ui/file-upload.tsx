import { useId, useRef, useState } from "react";
import { UploadCloud, File as FileIcon, X } from "lucide-react";
import "./file-upload.css";

type Attachment = { name: string; size: number; id?: string };
type Props = {
  id?: string;
  files?: Attachment[];
  onFiles: (files: File[]) => void | Promise<void>;
  onRemove: (index: number) => void;
  onDownload?: (file: Attachment) => void;
  onError: (message: string) => void;
  accept?: string;
  maxBytes?: number;
  multiple?: boolean;
  disabled?: boolean;
  label?: string;
};

export default function FileUpload({
  id: inputId,
  files = [],
  onFiles,
  onRemove,
  onDownload,
  onError,
  accept = "",
  maxBytes = 25 * 1024 * 1024,
  multiple = true,
  disabled = false,
  label = "Attach files",
}: Props) {
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const locked = disabled || saving;
  async function select(selected: File[]) {
    if (locked || !selected.length) return;
    const allowed = accept
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);
    const invalid = selected.find(
      (file) =>
        file.size > maxBytes ||
        (allowed.length &&
          !allowed.some((type) =>
            type.startsWith(".")
              ? file.name.toLowerCase().endsWith(type)
              : type.endsWith("/*")
                ? file.type.startsWith(type.slice(0, -1))
                : file.type === type,
          )),
    );
    if (invalid) {
      onError(
        `${invalid.name}: choose an allowed file up to ${maxBytes / 1024 / 1024} MB.`,
      );
      return;
    }
    setSaving(true);
    try {
      await onFiles(multiple ? selected : selected.slice(0, 1));
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Unable to attach files. Try again.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="file-upload" aria-busy={saving}>
      <input
        ref={input}
        id={inputId || id}
        type="file"
        hidden
        multiple={multiple}
        accept={accept}
        disabled={locked}
        aria-label={label}
        onChange={(event) => {
          const selected = Array.from(event.target.files || []);
          event.target.value = "";
          void select(selected);
        }}
      />
      <button
        type="button"
        className="file-upload-zone"
        data-dragging={dragging}
        disabled={locked}
        aria-label={label}
        onClick={() => input.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          if (!locked) setDragging(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node))
            setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void select(Array.from(event.dataTransfer.files));
        }}
      >
        <UploadCloud size={32} aria-hidden="true" />
        <strong>
          {saving ? "Saving files…" : "Drag & drop files or browse"}
        </strong>
        <span>
          {label} · Up to {maxBytes / 1024 / 1024} MB per file
        </span>
      </button>
      {files.length > 0 && (
        <ul className="file-upload-list" aria-label="Selected files">
          {files.map((file, index) => (
            <li key={file.id || `${file.name}-${index}`}>
              <FileIcon size={20} aria-hidden="true" />
              <div>
                {onDownload ? (
                  <button type="button" onClick={() => onDownload(file)}>
                    {file.name}
                  </button>
                ) : (
                  <strong>{file.name}</strong>
                )}
                <small>
                  {file.size < 1024
                    ? `${file.size} B`
                    : `${(file.size / 1024 / 1024).toFixed(2)} MB`}
                </small>
              </div>
              <button
                type="button"
                disabled={locked}
                aria-label={`Remove ${file.name}`}
                onClick={() => onRemove(index)}
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
