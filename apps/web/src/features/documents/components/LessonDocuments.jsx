import { useState } from "react";

import {
  Download,
  FileSpreadsheet,
  FileText,
  FileType,
  Presentation,
  Trash2,
  Upload,
} from "lucide-react";

import appToast from "@/lib/toast.js";
import documentApi from "@/features/documents/api.js";

import {
  ALLOWED_DOCUMENT_EXTENSIONS,
  ALLOWED_DOCUMENT_TYPES,
  MAX_DOCUMENT_SIZE,
} from "@/features/documents/lib/documentConstants.js";

import {
  formatFileSize,
  getDocumentIconClass,
  getDocumentName,
  getDocumentType,
  isValidDocument,
} from "@/features/documents/lib/document.js";

const LessonDocuments = ({
  lesson,
  onDocumentsUpdated,
}) => {
  const documents = Array.isArray(lesson?.documents)
    ? lesson.documents
    : [];

  const [uploading, setUploading] = useState(false);
  const [deletingDocumentId, setDeletingDocumentId] =
    useState(null);

  const handleSelectDocument = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    const result = isValidDocument(file, {
      allowedTypes: ALLOWED_DOCUMENT_TYPES,
      allowedExtensions: ALLOWED_DOCUMENT_EXTENSIONS,
      maxSize: MAX_DOCUMENT_SIZE,
    });

    if (!result.valid) {
      appToast.error(result.message);
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("document", file);

      const response = await documentApi.create(
        lesson.id,
        formData
      );

      const updatedDocuments = Array.isArray(
        response?.data
      )
        ? response.data
        : null;

      if (!updatedDocuments) {
        throw new Error(
          "Dữ liệu tài liệu trả về không hợp lệ."
        );
      }

      onDocumentsUpdated?.(updatedDocuments);

      appToast.success("Thêm tài liệu thành công.");
    } catch (error) {
      console.error(
        "Upload document error:",
        error
      );

      appToast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Không thể thêm tài liệu."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (
      !documentId ||
      uploading ||
      deletingDocumentId
    ) {
      return;
    }

    try {
      setDeletingDocumentId(documentId);

      await documentApi.delete(documentId);

      const updatedDocuments = documents.filter(
        (document) => document.id !== documentId
      );

      onDocumentsUpdated?.(updatedDocuments);

      appToast.success("Xóa tài liệu thành công.");
    } catch (error) {
      console.error(
        "Delete document error:",
        error
      );

      appToast.error(
        error?.response?.data?.message ||
        "Không thể xóa tài liệu."
      );
    } finally {
      setDeletingDocumentId(null);
    }
  };

  const handleDownloadDocument = async (document) => {
    if (
      !document?.id ||
      uploading ||
      deletingDocumentId
    ) {
      return;
    }

    try {
      await documentApi.download(
        document.id,
        document.name
      );
    } catch (error) {
      console.error(
        "Download document error:",
        error
      );

      appToast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Không thể tải tài liệu."
      );
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[var(--surface-2)] px-4 py-4 sm:px-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--muted)]">
          <FileText
            size={16}
            strokeWidth={1.8}
          />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-[13px] font-semibold text-[var(--ink)]">
            Tài liệu
          </h2>

          <p className="mt-0.5 text-[12px] text-[var(--faint)]">
            {documents.length > 0
              ? `${documents.length} tài liệu`
              : "Chưa có tài liệu"}
          </p>
        </div>

        <label
          className={[
            "inline-flex shrink-0 cursor-pointer",
            "items-center gap-1.5",
            "rounded-lg border px-2.5 py-2",
            "text-[12px] font-medium",
            "transition-colors",
            uploading
              ? "pointer-events-none border-[var(--line)] text-[var(--faint)]"
              : [
                "border-[var(--line)]",
                "bg-[var(--surface)] text-[var(--muted)]",
                "hover:border-[var(--line-strong)]",
                "hover:bg-[var(--surface-3)]",
                "hover:text-[var(--ink)]",
              ].join(" "),
          ].join(" ")}
        >
          <Upload size={13} />

          {uploading ? "Đang thêm..." : "Thêm"}

          <input
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
            className="hidden"
            disabled={uploading}
            onChange={handleSelectDocument}
          />
        </label>
      </div>

      <div className="space-y-3 p-4 sm:p-5">
      {/* Documents */}
      {documents.length > 0 ? (
        <div className="divide-y divide-[var(--surface-2)] rounded-xl border border-[var(--line)]">
          {documents.map((document, index) => {
            const fileName = getDocumentName(
              document,
              index
            );

            const fileType = getDocumentType(
              fileName,
              document.mimeType
            );

            const isDeleting =
              deletingDocumentId ===
              document.id;

            return (
              <div
                key={
                  document.id || index
                }
                className={[
                  "flex items-center gap-3",
                  "px-3 py-3",
                  "transition-colors",
                  "hover:bg-[var(--surface-3)]",
                ].join(" ")}
              >
                {/* Icon */}
                <div
                  className={[
                    "flex h-9 w-9 shrink-0",
                    "items-center justify-center",
                    "rounded-lg",
                    getDocumentIconClass(
                      fileName,
                      document.mimeType
                    ),
                  ].join(" ")}
                >
                  <DocumentIcon
                    fileName={fileName}
                    mimeType={
                      document.mimeType
                    }
                  />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-xs font-medium text-[var(--ink-2)]"
                    title={fileName}
                  >
                    {fileName}
                  </p>

                  <p className="mt-0.5 text-[12px] text-[var(--faint)]">
                    {fileType}
                    {document.size
                      ? ` · ${formatFileSize(
                        document.size
                      )}`
                      : ""}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center">
                  <button
                    type="button"
                    onClick={() => handleDownloadDocument(document)}
                    disabled={
                      uploading ||
                      deletingDocumentId
                    }
                    className={[
                      "flex h-8 w-8",
                      "items-center justify-center",
                      "rounded-full",
                      "text-[var(--faint)]",
                      "transition-colors",
                      "hover:bg-[var(--brand-soft)]",
                      "hover:text-[var(--brand-text)]",
                      "disabled:cursor-not-allowed",
                      "disabled:opacity-40",
                    ].join(" ")}
                    title="Tải xuống"
                  >
                    <Download size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteDocument(
                        document.id
                      )
                    }
                    disabled={
                      uploading ||
                      isDeleting
                    }
                    className={[
                      "flex h-8 w-8",
                      "items-center justify-center",
                      "rounded-full",
                      "text-[var(--faint)]",
                      "transition-colors",
                      "hover:bg-[var(--danger-soft)]",
                      "hover:text-[var(--danger)]",
                      "disabled:cursor-not-allowed",
                      "disabled:opacity-40",
                    ].join(" ")}
                    title="Xóa"
                  >
                    {isDeleting ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--danger)]" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <label
          className={[
            "flex min-h-32 cursor-pointer",
            "flex-col items-center justify-center",
            "rounded-xl border border-dashed",
            "border-[var(--line-strong)]",
            "bg-[var(--surface-3)]",
            "px-4 text-center",
            "transition-colors",
            "hover:border-[var(--faint)]",
            "hover:bg-[var(--surface)]",
          ].join(" ")}
        >
          <Upload
            size={18}
            className="text-[var(--faint)]"
          />

          <p className="mt-2 text-xs font-medium text-[var(--muted)]">
            Thêm tài liệu
          </p>

          <p className="mt-1 text-[12px] text-[var(--faint)]">
            PDF, Word, PowerPoint, Excel
          </p>

          <input
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
            className="hidden"
            disabled={uploading}
            onChange={handleSelectDocument}
          />
        </label>
      )}

      <p className="text-[12px] leading-4 text-[var(--faint)]">
        PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX · tối đa
        20MB/file
      </p>
      </div>
    </section>
  );
};

const DocumentIcon = ({
  fileName = "",
  mimeType = "",
}) => {
  const type = getDocumentType(
    fileName,
    mimeType
  );

  if (type === "POWERPOINT") {
    return (
      <Presentation
        size={17}
        strokeWidth={1.8}
      />
    );
  }

  if (type === "EXCEL") {
    return (
      <FileSpreadsheet
        size={17}
        strokeWidth={1.8}
      />
    );
  }

  if (type === "WORD") {
    return (
      <FileType
        size={17}
        strokeWidth={1.8}
      />
    );
  }

  return (
    <FileText
      size={17}
      strokeWidth={1.8}
    />
  );
};

export default LessonDocuments; 
