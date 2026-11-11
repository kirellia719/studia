import {
  FileSpreadsheet,
  FileText,
  FileType,
  Presentation,
} from "lucide-react";

const getDocumentIcon = (
  fileName = "",
  mimeType = ""
) => {
  const extension = fileName
    .split(".")
    .pop()
    .toLowerCase();

  // PDF
  if (
    extension === "pdf" ||
    mimeType === "application/pdf"
  ) {
    return {
      Icon: FileText,
      className: "bg-[var(--danger-soft)] text-[var(--danger)]",
    };
  }

  // Word
  if (["doc", "docx"].includes(extension)) {
    return {
      Icon: FileType,
      className: "bg-[var(--brand-soft)] text-[var(--brand)]",
    };
  }

  // PowerPoint
  if (["ppt", "pptx"].includes(extension)) {
    return {
      Icon: Presentation,
      className: "bg-[var(--accent-soft)] text-[var(--accent)]",
    };
  }

  // Excel
  if (["xls", "xlsx"].includes(extension)) {
    return {
      Icon: FileSpreadsheet,
      className: "bg-[var(--success-soft)] text-[var(--success)]",
    };
  }

  // Default
  return {
    Icon: FileText,
    className: "bg-[var(--surface-2)] text-[var(--muted)]",
  };
};

export default getDocumentIcon;
