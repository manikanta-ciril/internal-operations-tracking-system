import { useEffect, useState } from "react";
import { Dialog } from "radix-ui";
import { Download, Eye, FileText, LoaderCircle, X } from "lucide-react";
import { Button } from "../../shared/work-ui/button";
import { downloadProof, previewProof } from "../daily-report/exportTools";

const previewable = /\.(png|jpe?g|gif|webp|pdf|txt|csv|md|mp4|mov|mp3|wav)$/i;
export default function EvidenceFile({ file }) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const { id, name, server } = file;
  useEffect(() => {
    if (!open) return;
    let active = true,
      url;
    previewProof({ id, name, server })
      .then(async (blob) => {
        url = URL.createObjectURL(blob);
        const text = /\.(txt|csv|md)$/i.test(name)
          ? await blob.slice(0, 262144).text()
          : null;
        if (active) setPreview({ url, type: blob.type, text });
        else URL.revokeObjectURL(url);
      })
      .catch((failure) => {
        if (active) setError(failure.message);
      });
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [open, id, name, server]);
  async function download() {
    setDownloading(true);
    setError("");
    try {
      await downloadProof(file);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setDownloading(false);
    }
  }
  return (
    <div className="evidence-file">
      <div className="evidence-file-name">
        <FileText size={19} />
        <div>
          <strong>{file.name}</strong>
          <small>
            {file.size
              ? file.size < 1024
                ? `${file.size} bytes`
                : file.size < 1048576
                  ? `${(file.size / 1024).toFixed(1)} KB`
                  : `${(file.size / 1048576).toFixed(1)} MB`
              : "Saved attachment"}
          </small>
        </div>
      </div>
      <div className="evidence-file-actions">
        {previewable.test(file.name) && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setPreview(null);
              setError("");
              setOpen(true);
            }}
            aria-label={`Preview ${file.name}`}
          >
            <Eye size={16} />
            Preview
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          disabled={downloading}
          onClick={download}
          aria-label={`Download ${file.name}`}
        >
          {downloading ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
          {downloading ? "Downloading…" : "Download"}
        </Button>
      </div>
      {!open && error && (
        <p role="alert" className="error-copy">
          {error}
        </p>
      )}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="evidence-preview-overlay" />
          <Dialog.Content
            className="evidence-preview-dialog"
            aria-describedby={undefined}
          >
            <header>
              <Dialog.Title>{file.name}</Dialog.Title>
              <Dialog.Close asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Close file preview"
                >
                  <X />
                </Button>
              </Dialog.Close>
            </header>
            <div className="evidence-preview-body">
              {error ? (
                <p role="alert">{error}</p>
              ) : !preview ? (
                <p role="status">
                  <LoaderCircle className="animate-spin" />
                  Loading preview…
                </p>
              ) : preview.text !== null ? (
                <pre>
                  {preview.text}
                  {preview.text.length >= 262144
                    ? "\nPreview limited to 256 KB. Download to read the full file."
                    : ""}
                </pre>
              ) : /^image\//.test(preview.type) ? (
                <img src={preview.url} alt={file.name} />
              ) : /^video\//.test(preview.type) ||
                /\.(mp4|mov)$/i.test(file.name) ? (
                <video src={preview.url} controls />
              ) : /^audio\//.test(preview.type) ||
                /\.(mp3|wav)$/i.test(file.name) ? (
                <audio src={preview.url} controls />
              ) : (
                <iframe
                  src={preview.url}
                  title={`Preview of ${file.name}`}
                  sandbox=""
                  referrerPolicy="no-referrer"
                />
              )}
            </div>
            <footer>
              <span>
                Source and office formats can be downloaded to open in their own
                applications.
              </span>
              <Button
                variant="outline"
                disabled={downloading}
                onClick={download}
              >
                <Download size={16} />
                Download file
              </Button>
            </footer>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
