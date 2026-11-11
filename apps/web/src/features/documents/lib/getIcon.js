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
      className: "bg-[#FEF2F2] text-[#DC2626]",
    };
  }

  // Word
  if (["doc", "docx"].includes(extension)) {
    return {
      Icon: FileType,
      className: "bg-[#EFF6FF] text-[#2563EB]",
    };
  }

  // PowerPoint
  if (["ppt", "pptx"].includes(extension)) {
    return {
      Icon: Presentation,
      className: "bg-[#FFF7ED] text-[#EA580C]",
    };
  }

  // Excel
  if (["xls", "xlsx"].includes(extension)) {
    return {
      Icon: FileSpreadsheet,
      className: "bg-[#F0FDF4] text-[#16A34A]",
    };
  }

  // Default
  return {
    Icon: FileText,
    className: "bg-[#F4F4F5] text-[#71717A]",
  };
};

export default getDocumentIcon;
