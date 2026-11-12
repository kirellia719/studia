// utils/document.js

export const formatFileSize = (bytes) => {
  if (!bytes || bytes <= 0) {
    return "0 KB";
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export const getFileExtension = (fileName = "") => {
  const parts = fileName.split(".");

  if (parts.length < 2) {
    return "";
  }

  return `.${parts.pop().toLowerCase()}`;
};

export const getDocumentType = (
  fileName = "",
  mimeType = ""
) => {
  const extension =
    getFileExtension(fileName);

  if (
    extension === ".pdf" ||
    mimeType === "application/pdf"
  ) {
    return "PDF";
  }

  if (
    [".doc", ".docx"].includes(
      extension
    )
  ) {
    return "WORD";
  }

  if (
    [".ppt", ".pptx"].includes(
      extension
    )
  ) {
    return "POWERPOINT";
  }

  if (
    [".xls", ".xlsx"].includes(
      extension
    )
  ) {
    return "EXCEL";
  }

  return "FILE";
};

export const getDocumentIconClass = (
  fileName = "",
  mimeType = ""
) => {
  const type = getDocumentType(
    fileName,
    mimeType
  );

  switch (type) {
    case "PDF":
      return "bg-[var(--danger-soft)] text-[var(--danger)]";

    case "WORD":
      return "bg-[var(--brand-soft)] text-[var(--brand)]";

    case "POWERPOINT":
      return "bg-[var(--accent-soft)] text-[var(--accent)]";

    case "EXCEL":
      return "bg-[var(--success-soft)] text-[var(--success)]";

    default:
      return "bg-[var(--surface-2)] text-[var(--muted)]";
  }
};

export const getDocumentName = (
  document,
  index = 0
) => {
  return (
    document?.name ||
    document?.fileName ||
    `Tài liệu ${index + 1}`
  );
};

export const getFileKey = (file) => {
  return `${file.name}-${file.size}-${file.lastModified}`;
};

export const isValidDocument = (file, {
  allowedTypes,
  allowedExtensions,
  maxSize,
}) => {
  const extension =
    getFileExtension(file.name);

  const validType =
    allowedTypes.includes(file.type) ||
    allowedExtensions.includes(extension);

  if (!validType) {
    return {
      valid: false,
      message: `${file.name} - định dạng không hỗ trợ`,
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      message: `${file.name} - vượt quá 20MB`,
    };
  }

  return {
    valid: true,
  };
};
