const MAX_QUESTIONS = 50;
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const DOCX_MIME =
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const LAO_DIGITS = "໐໑໒໓໔໕໖໗໘໙";

const INVISIBLE_CHARS = /[\u200B-\u200D\u2060\uFEFF\u00AD]/g;

const QUESTION_LINE =
    /^\s*(?:(?:câu|cau|ຄຳຖາມ|ຄໍາຖາມ)\s*)?(\d{1,3})\s*[.)、:：\-–—]\s*(?!\d)(.*)$/iu;

const OPTION_LINE =
    /^\s*([*•+])?\s*([A-Za-z\u0E81-\u0EAE\u0ED0-\u0ED9])\s*([.)、:：/\-]|\*)\s*(.*)$/u;

const normalizeText = (value = "") => {
    let text = String(value)
        .replace(INVISIBLE_CHARS, "")
        .normalize("NFC");

    text = text.replace(/\r\n?/g, "\n");
    text = text.replace(/[\u00A0\u2007\u202F]/g, " ");

    return text;
};

// Chỉ dùng để nhận diện số thứ tự, không đụng vào nội dung câu hỏi.
const toAsciiDigits = (value) =>
    value
        .replace(
            /[\u0ED0-\u0ED9]/g,
            (char) => String(LAO_DIGITS.indexOf(char))
        )
        .replace(
            /[\uFF10-\uFF19]/g,
            (char) => String(char.charCodeAt(0) - 0xff10)
        );

const decodeTextBuffer = (buffer) => {
    const bytes = new Uint8Array(buffer);

    if (
        bytes.length >= 3 &&
        bytes[0] === 0xef &&
        bytes[1] === 0xbb &&
        bytes[2] === 0xbf
    ) {
        return new TextDecoder("utf-8").decode(bytes.subarray(3));
    }

    if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
        return new TextDecoder("utf-16le").decode(bytes.subarray(2));
    }

    if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
        return new TextDecoder("utf-16be").decode(bytes.subarray(2));
    }

    try {
        return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
        // Không phải UTF-8 hợp lệ: thử bảng mã tiếng Việt cũ trước khi quy
        // về windows-1252 để không làm hỏng nội dung.
    }

    try {
        return new TextDecoder("windows-1258").decode(bytes);
    } catch {
        return new TextDecoder("windows-1252").decode(bytes);
    }
};

const decodeXmlEntities = (value) =>
    value
        .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
            String.fromCodePoint(Number.parseInt(hex, 16))
        )
        .replace(/&#(\d+);/g, (_, decimal) =>
            String.fromCodePoint(Number(decimal))
        )
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, "&");

const DOCX_TOKEN =
    /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:t\s*\/>|<w:(?:tab|ptab)\b[^>]*\/>|<w:(?:br|cr)\b[^>]*\/>/g;

const documentXmlToText = (xml) => {
    const lines = [];

    String(xml)
        .replace(/<w:instrText\b[\s\S]*?<\/w:instrText>/g, "")
        .split(/<\/w:p>/)
        .forEach((paragraph) => {
            let line = "";

            DOCX_TOKEN.lastIndex = 0;

            let match = DOCX_TOKEN.exec(paragraph);

            while (match) {
                if (match[1] !== undefined) {
                    line += decodeXmlEntities(match[1]);
                } else if (match[0].includes("<w:tab")) {
                    line += "\t";
                } else {
                    line += "\n";
                }

                match = DOCX_TOKEN.exec(paragraph);
            }

            lines.push(line);
        });

    return lines.join("\n");
};

const readZipEntry = async (buffer, targetName) => {
    const bytes = new Uint8Array(buffer);
    const view = new DataView(buffer);

    let endOfCentralDirectory = -1;
    const lowestOffset = Math.max(0, bytes.length - 0xffff - 22);

    for (let index = bytes.length - 22; index >= lowestOffset; index -= 1) {
        if (view.getUint32(index, true) === 0x06054b50) {
            endOfCentralDirectory = index;
            break;
        }
    }

    if (endOfCentralDirectory < 0) {
        throw new Error("DOCX_INVALID");
    }

    const totalEntries = view.getUint16(endOfCentralDirectory + 10, true);
    let offset = view.getUint32(endOfCentralDirectory + 16, true);

    for (let entry = 0; entry < totalEntries; entry += 1) {
        if (view.getUint32(offset, true) !== 0x02014b50) {
            break;
        }

        const method = view.getUint16(offset + 10, true);
        const compressedSize = view.getUint32(offset + 20, true);
        const nameLength = view.getUint16(offset + 28, true);
        const extraLength = view.getUint16(offset + 30, true);
        const commentLength = view.getUint16(offset + 32, true);
        const localOffset = view.getUint32(offset + 42, true);

        const name = new TextDecoder("utf-8").decode(
            bytes.subarray(offset + 46, offset + 46 + nameLength)
        );

        if (name === targetName) {
            const localNameLength = view.getUint16(localOffset + 26, true);
            const localExtraLength = view.getUint16(
                localOffset + 28,
                true
            );
            const dataStart =
                localOffset + 30 + localNameLength + localExtraLength;
            const data = bytes.subarray(
                dataStart,
                dataStart + compressedSize
            );

            if (method === 0) {
                return data;
            }

            if (method !== 8) {
                throw new Error("DOCX_INVALID");
            }

            if (typeof DecompressionStream !== "function") {
                throw new Error("DOCX_UNSUPPORTED");
            }

            const stream = new Blob([data])
                .stream()
                .pipeThrough(new DecompressionStream("deflate-raw"));

            return new Uint8Array(
                await new Response(stream).arrayBuffer()
            );
        }

        offset += 46 + nameLength + extraLength + commentLength;
    }

    return null;
};

const isZipBuffer = (buffer) => {
    const bytes = new Uint8Array(buffer, 0, Math.min(4, buffer.byteLength));

    return (
        bytes.length === 4 &&
        bytes[0] === 0x50 &&
        bytes[1] === 0x4b &&
        bytes[2] === 0x03 &&
        bytes[3] === 0x04
    );
};

const isLegacyDocBuffer = (buffer) => {
    const bytes = new Uint8Array(buffer, 0, Math.min(4, buffer.byteLength));

    return (
        bytes.length === 4 &&
        bytes[0] === 0xd0 &&
        bytes[1] === 0xcf &&
        bytes[2] === 0x11 &&
        bytes[3] === 0xe0
    );
};

const extractDocxText = async (buffer) => {
    if (typeof DecompressionStream !== "function") {
        throw new Error("DOCX_UNSUPPORTED");
    }

    const documentXml = await readZipEntry(buffer, "word/document.xml");

    if (!documentXml) {
        throw new Error("DOCX_INVALID");
    }

    return documentXmlToText(new TextDecoder("utf-8").decode(documentXml));
};

const readQuizFile = async (file) => {
    if (!file) {
        throw new Error("EMPTY_FILE");
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new Error("FILE_TOO_LARGE");
    }

    const buffer = await file.arrayBuffer();
    const name = (file.name || "").toLowerCase();
    const isDocx =
        name.endsWith(".docx") ||
        file.type === DOCX_MIME ||
        isZipBuffer(buffer);

    if (isDocx) {
        return extractDocxText(buffer);
    }

    if (name.endsWith(".doc") || isLegacyDocBuffer(buffer)) {
        throw new Error("DOC_UNSUPPORTED");
    }

    return decodeTextBuffer(buffer);
};

const parseQuizText = (input = "") => {
    const text = normalizeText(input);
    const drafts = [];
    const warnings = [];

    let current = null;

    const finishDraft = () => {
        if (current) {
            drafts.push(current);
            current = null;
        }
    };

    text.split("\n").forEach((rawLine) => {
        const line = rawLine.replace(/\s+$/, "").trim();

        if (!line) return;

        const probe = toAsciiDigits(line);
        const questionMatch = probe.match(QUESTION_LINE);
        const optionMatch = probe.match(OPTION_LINE);

        if (questionMatch) {
            finishDraft();
            current = {
                content: line
                    .slice(line.length - questionMatch[2].length)
                    .trim(),
                options: [],
            };

            return;
        }

        if (optionMatch) {
            if (!current) {
                current = { content: "", options: [] };
            }

            const [, star, , delimiter] = optionMatch;

            current.options.push({
                content: line
                    .slice(line.length - optionMatch[4].length)
                    .trim(),
                isCorrect: Boolean(star) || delimiter === "*",
            });

            return;
        }

        if (!current) {
            current = { content: line, options: [] };
            return;
        }

        if (current.options.length > 0) {
            const lastOption =
                current.options[current.options.length - 1];

            lastOption.content =
                `${lastOption.content} ${line}`.trim();
        } else {
            current.content = `${current.content} ${line}`.trim();
        }
    });

    finishDraft();

    const questions = [];

    drafts.forEach((draft, draftIndex) => {
        const number = draftIndex + 1;
        const content = draft.content.trim();
        const options = draft.options
            .filter((option) => option.content)
            .map((option) => ({ ...option }));

        if (!content) {
            warnings.push({
                number,
                level: "error",
                message: "Không đọc được nội dung câu hỏi.",
            });

            return;
        }

        if (options.length < MIN_OPTIONS) {
            warnings.push({
                number,
                level: "error",
                message: `Cần ít nhất ${MIN_OPTIONS} đáp án nhưng chỉ đọc được ${options.length}.`,
            });

            return;
        }

        if (options.length > MAX_OPTIONS) {
            warnings.push({
                number,
                level: "warn",
                message: `Có ${options.length} đáp án, chỉ nhập ${MAX_OPTIONS} đáp án đầu.`,
            });

            options.length = MAX_OPTIONS;
        }

        const correctCount = options.filter(
            (option) => option.isCorrect
        ).length;

        if (correctCount === 0) {
            options[0].isCorrect = true;

            warnings.push({
                number,
                level: "warn",
                message:
                    "Chưa có đáp án đánh dấu * nên tạm chọn đáp án đầu tiên.",
            });
        }

        if (correctCount > 1) {
            let keptCorrect = false;

            options.forEach((option) => {
                if (!option.isCorrect) return;

                if (keptCorrect) {
                    option.isCorrect = false;
                } else {
                    keptCorrect = true;
                }
            });

            warnings.push({
                number,
                level: "warn",
                message:
                    "Có nhiều đáp án đánh dấu * nên chỉ giữ đáp án đúng đầu tiên.",
            });
        }

        questions.push({
            content,
            options: options.map((option) => ({
                content: option.content,
                isCorrect: option.isCorrect,
            })),
        });
    });

    return { questions, warnings };
};

export {
    MAX_FILE_SIZE,
    MAX_OPTIONS,
    MAX_QUESTIONS,
    MIN_OPTIONS,
    decodeTextBuffer,
    documentXmlToText,
    extractDocxText,
    normalizeText,
    parseQuizText,
    readQuizFile,
};
