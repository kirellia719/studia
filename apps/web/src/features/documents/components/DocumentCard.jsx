import { Download } from "lucide-react";

import {
  formatFileSize,
  getDocumentType,
} from "@/features/documents/lib/document.js";

import getDocumentIcon from "@/features/documents/lib/getIcon.js";

const DocumentCard = ({
  document,
  onDownload,
  downloading = false,
}) => {
  if (!document) {
    return null;
  }

  const fileName = document.name || "Tài liệu";

  const fileType = getDocumentType(
    fileName,
    document.mimeType
  );

  const {
    Icon: DocumentIcon,
    className: iconClass,
  } = getDocumentIcon(
    fileName,
    document.mimeType
  );

  return (
    <div className="flex items-center gap-3 px-4 py-3 sm:px-5">
      {/* File icon */}
      <div
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center",
          "rounded-lg",
          iconClass,
        ].join(" ")}
      >
        <DocumentIcon
          size={19}
          strokeWidth={1.8}
        />
      </div>

      {/* File information */}
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-xs font-medium text-[var(--ink-2)]"
          title={fileName}
        >
          {fileName}
        </p>

        <div className="mt-0.5 flex items-center gap-1.5">
          <span
            className={[
              "text-[12px] font-medium",
              iconClass.split(" ").find((className) =>
                className.startsWith("text-")
              ),
            ].join(" ")}
          >
            {fileType}
          </span>

          {document.size > 0 && (
            <>
              <span className="text-[12px] text-[var(--line-strong)]">
                ·
              </span>

              <span className="text-[12px] text-[var(--faint)]">
                {formatFileSize(document.size)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Download */}
      <button
        type="button"
        onClick={() => onDownload?.(document)}
        disabled={downloading || !onDownload}
        title="Tải xuống"
        aria-label={`Tải xuống ${fileName}`}
        className={[
          "flex h-11 w-11 shrink-0 items-center justify-center",
          "rounded-full",
          "text-[var(--faint)]",
          "transition-colors",
          "hover:bg-[var(--surface-2)] hover:text-[var(--ink)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
        ].join(" ")}
      >
        {downloading ? (
          <span
            className={[
              "h-4 w-4 animate-spin rounded-full",
              "border-2 border-[var(--line)]",
              "border-t-[var(--muted)]",
            ].join(" ")}
          />
        ) : (
          <Download
            size={16}
            strokeWidth={1.8}
          />
        )}
      </button>
    </div>
  );
};

export default DocumentCard;
