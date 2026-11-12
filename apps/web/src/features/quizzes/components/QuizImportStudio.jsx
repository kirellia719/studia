import { useEffect, useMemo, useRef, useState } from "react";

import {
    AlertTriangle,
    Check,
    FileUp,
    Loader2,
    UploadCloud,
    X,
} from "lucide-react";

import {
    MAX_QUESTIONS,
    parseQuizText,
    readQuizFile,
} from "@/features/quizzes/lib/quizImport.js";

const FILE_ERRORS = {
    FILE_TOO_LARGE: "File vượt quá 5MB. Hãy chia nhỏ rồi nhập lại.",
    DOC_UNSUPPORTED:
        "File .doc (Word 97-2003) chưa hỗ trợ. Mở bằng Word rồi lưu thành .docx.",
    DOCX_UNSUPPORTED:
        "Trình duyệt này chưa đọc được .docx. Hãy dùng ô “Dán văn bản” hoặc lưu file thành .txt.",
    DOCX_INVALID:
        "Không tìm thấy nội dung trong file .docx. Kiểm tra lại file giúp mình nhé.",
    EMPTY_FILE: "File rỗng.",
    NO_QUESTIONS:
        "Chưa nhận diện được câu hỏi nào. Kiểm tra lại cấu trúc: mỗi câu bắt đầu bằng “1.”, đáp án đúng có dấu “*” phía trước.",
};

const SAMPLE = `1. Thủ đô của Lào là thành phố nào?
*A. Viêng Chăn
B. Luang Prabang
C. Savannakhet
D. Pakse

2. ພາສາລາວມີກີ່ສຽງ?
*ກ. ຫົກສຽງ
ຂ. ຫ້າສຽງ
ຄ. ສີ່ສຽງ
ງ. ສາມສຽງ`;

const optionLabel = (index) =>
    index < 26 ? String.fromCharCode(65 + index) : `${index + 1}`;

const QuizImportStudio = ({
    open,
    onClose,
    onImport,
    importing = false,
    existingCount = 0,
}) => {
    const inputRef = useRef(null);
    const closeRef = useRef(null);

    const [step, setStep] = useState("source");
    const [source, setSource] = useState("file");
    const [dragging, setDragging] = useState(false);
    const [parsing, setParsing] = useState(false);
    const [fileName, setFileName] = useState("");
    const [pasteValue, setPasteValue] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [questions, setQuestions] = useState([]);
    const [warnings, setWarnings] = useState([]);
    const [selected, setSelected] = useState(() => new Set());
    const [mode, setMode] = useState(
        existingCount > 0 ? "append" : "replace"
    );

    useEffect(() => {
        if (!open) return undefined;

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        const handleKeyDown = (event) => {
            if (event.key === "Escape" && !importing) {
                onClose?.();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;

            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [open, importing, onClose]);

    useEffect(() => {
        if (open) return;

        setStep("source");
        setSource("file");
        setDragging(false);
        setParsing(false);
        setFileName("");
        setPasteValue("");
        setErrorMessage("");
        setQuestions([]);
        setWarnings([]);
        setSelected(new Set());
        setMode(existingCount > 0 ? "append" : "replace");
    }, [open, existingCount]);

    useEffect(() => {
        if (open) {
            closeRef.current?.focus();
        }
    }, [open]);

    const warningByIndex = useMemo(() => {
        const map = new Map();

        warnings.forEach((warning) => {
            map.set(warning.number - 1, warning);
        });

        return map;
    }, [warnings]);

    const selectedQuestions = useMemo(
        () => questions.filter((_, index) => selected.has(index)),
        [questions, selected]
    );

    const availableSlots =
        mode === "append"
            ? Math.max(0, MAX_QUESTIONS - existingCount)
            : MAX_QUESTIONS;

    const overLimit = selectedQuestions.length > availableSlots;

    if (!open) {
        return null;
    }

    const applyParsed = (result, name) => {
        if (result.questions.length === 0) {
            setErrorMessage(FILE_ERRORS.NO_QUESTIONS);
            return;
        }

        setQuestions(result.questions);
        setWarnings(result.warnings);
        setSelected(
            new Set(result.questions.map((_, index) => index))
        );
        setFileName(name);
        setErrorMessage("");
        setStep("preview");

        const slotsLeft =
            mode === "append"
                ? Math.max(0, MAX_QUESTIONS - existingCount)
                : MAX_QUESTIONS;

        if (result.questions.length > slotsLeft) {
            setSelected(
                new Set(
                    result.questions
                        .slice(0, slotsLeft)
                        .map((_, index) => index)
                )
            );
        }
    };

    const handleFile = async (file) => {
        if (!file || parsing) return;

        setParsing(true);
        setErrorMessage("");

        try {
            const text = await readQuizFile(file);

            applyParsed(parseQuizText(text), file.name);
        } catch (error) {
            setErrorMessage(
                FILE_ERRORS[error?.message] ||
                    "Không đọc được file này. Hãy thử file .txt hoặc dán nội dung."
            );
        } finally {
            setParsing(false);
        }
    };

    const handlePasteParse = () => {
        if (!pasteValue.trim()) {
            setErrorMessage(
                "Hãy dán nội dung đề vào ô bên trên."
            );

            return;
        }

        applyParsed(parseQuizText(pasteValue), "Văn bản dán");
    };

    const backToSource = () => {
        setStep("source");
        setErrorMessage("");
        setQuestions([]);
        setWarnings([]);
        setSelected(new Set());

        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const toggleQuestion = (index) => {
        setSelected((previous) => {
            const next = new Set(previous);

            if (next.has(index)) {
                if (next.size === 1) return previous;

                next.delete(index);
            } else {
                next.add(index);
            }

            return next;
        });
    };

    const chooseCorrect = (questionIndex, optionIndex) => {
        setQuestions((previous) =>
            previous.map((question, index) => {
                if (index !== questionIndex) return question;

                return {
                    ...question,
                    options: question.options.map(
                        (option, currentOptionIndex) => ({
                            ...option,
                            isCorrect:
                                currentOptionIndex ===
                                optionIndex,
                        })
                    ),
                };
            })
        );
    };

    const handleSubmit = () => {
        if (importing || overLimit) return;

        if (selectedQuestions.length === 0) {
            setErrorMessage(
                "Chọn ít nhất một câu để nhập."
            );

            return;
        }

        onImport?.(selectedQuestions, mode);
    };

    const renderSource = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-[var(--surface-2)] p-1">
                {[
                    { id: "file", label: "Tải file" },
                    { id: "paste", label: "Dán văn bản" },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        aria-pressed={source === tab.id}
                        onClick={() => setSource(tab.id)}
                        className={[
                            "h-9 rounded-full text-[12px] font-medium",
                            "transition-colors",
                            source === tab.id
                                ? "bg-[var(--surface)] font-semibold text-[var(--ink)] shadow-sm"
                                : "text-[var(--muted)] hover:text-[var(--ink)]",
                        ].join(" ")}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {source === "file" ? (
                <label
                    onDragOver={(event) => {
                        event.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(event) => {
                        event.preventDefault();
                        setDragging(false);

                        handleFile(
                            event.dataTransfer?.files?.[0]
                        );
                    }}
                    className={[
                        "flex cursor-pointer flex-col items-center justify-center",
                        "rounded-2xl border border-dashed px-4 py-9 text-center",
                        "transition-colors",
                        dragging
                            ? "border-[var(--brand)] bg-[var(--brand-soft)]"
                            : "border-[var(--line-strong)] bg-[var(--surface-3)] hover:border-[var(--faint)]",
                        parsing
                            ? "pointer-events-none opacity-70"
                            : "",
                    ].join(" ")}
                >
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--muted)] shadow-sm">
                        {parsing ? (
                            <Loader2
                                size={18}
                                className="animate-spin"
                            />
                        ) : (
                            <UploadCloud size={19} strokeWidth={1.8} />
                        )}
                    </span>

                    <span className="mt-3 text-[13px] font-semibold text-[var(--ink)]">
                        {parsing
                            ? "Đang đọc file..."
                            : "Kéo thả hoặc chọn file"}
                    </span>

                    <span className="mt-1 text-[12px] text-[var(--faint)]">
                        .txt, .docx · tối đa 5MB
                    </span>

                    <input
                        ref={inputRef}
                        type="file"
                        accept=".txt,.docx,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        className="hidden"
                        disabled={parsing}
                        onChange={(event) =>
                            handleFile(event.target.files?.[0])
                        }
                    />
                </label>
            ) : (
                <div className="space-y-2">
                    <textarea
                        value={pasteValue}
                        onChange={(event) =>
                            setPasteValue(event.target.value)
                        }
                        rows={11}
                        spellCheck={false}
                        placeholder={SAMPLE}
                        className={[
                            "w-full rounded-2xl border border-[var(--line)]",
                            "bg-[var(--surface)] px-3 py-2.5",
                            "text-[13px] leading-6 text-[var(--ink)]",
                            "outline-none placeholder:text-[var(--faint)]",
                            "focus:border-[var(--brand)]",
                            "focus:ring-2 focus:ring-[var(--brand)]/10",
                        ].join(" ")}
                    />

                    <button
                        type="button"
                        onClick={handlePasteParse}
                        disabled={!pasteValue.trim()}
                        className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-[var(--brand-solid)] px-4 text-[12px] font-semibold text-white transition hover:bg-[var(--brand-solid-hover)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                        <FileUp size={15} />
                        Phân tích văn bản
                    </button>
                </div>
            )}

            <details className="rounded-xl border border-[var(--line)] bg-[var(--surface-3)] px-3 py-2.5">
                <summary className="cursor-pointer text-[12px] font-medium text-[var(--ink-2)]">
                    Xem cấu trúc mẫu
                </summary>

                <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-lg bg-[var(--surface)] p-3 text-[12px] leading-5 text-[var(--muted)]">
                    {SAMPLE}
                </pre>

                <p className="mt-2 text-[12px] leading-5 text-[var(--faint)]">
                    Mỗi câu bắt đầu bằng số và dấu chấm. Đáp án
                    đúng đánh dấu <code>*</code> ngay trước nhãn.
                    Nhãn có thể là A–F hoặc ກ, ຂ, ຄ, ງ… Nội dung
                    tiếng Việt và tiếng Lào được giữ nguyên.
                </p>
            </details>

            <p className="text-[12px] leading-5 text-[var(--faint)]">
                Hỗ trợ UTF-8, UTF-16 và bảng mã tiếng Việt cũ.
                File .doc cần lưu lại thành .docx.
            </p>
        </div>
    );

    const renderPreview = () => (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-3)] px-3 py-2.5">
                <div className="min-w-0">
                    <p className="truncate text-[12px] font-semibold text-[var(--ink)]">
                        {fileName}
                    </p>

                    <p className="mt-0.5 text-[12px] text-[var(--faint)]">
                        Nhận diện {questions.length} câu
                        {warnings.length > 0
                            ? ` · ${warnings.length} mục cần kiểm tra`
                            : ""}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={backToSource}
                    className="shrink-0 rounded-full border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1.5 text-[12px] font-medium text-[var(--muted)] transition hover:text-[var(--ink)]"
                >
                    Chọn file khác
                </button>
            </div>

            {warnings.length > 0 && (
                <ul className="space-y-1.5">
                    {warnings.map((warning, index) => (
                        <li
                            key={`${warning.number}-${index}`}
                            className={[
                                "flex items-start gap-2 rounded-lg px-2.5 py-2",
                                "text-[12px] leading-5",
                                warning.level === "error"
                                    ? "bg-[var(--danger-soft)] text-[var(--danger)]"
                                    : "bg-[var(--surface-3)] text-[var(--muted)]",
                            ].join(" ")}
                        >
                            <AlertTriangle
                                size={13}
                                className="mt-0.5 shrink-0"
                            />

                            <span className="min-w-0">
                                Câu {warning.number}:{" "}
                                {warning.message}
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            {existingCount > 0 && (
                <div className="grid gap-1.5 rounded-xl border border-[var(--line)] p-1 sm:grid-cols-2">
                    {[
                        {
                            id: "append",
                            label: "Thêm vào đề hiện có",
                            hint: `${existingCount} câu đã có`,
                        },
                        {
                            id: "replace",
                            label: "Thay thế toàn bộ",
                            hint: "Xoá đề cũ",
                        },
                    ].map((option) => (
                        <button
                            key={option.id}
                            type="button"
                            aria-pressed={mode === option.id}
                            onClick={() => setMode(option.id)}
                            className={[
                                "rounded-lg px-3 py-2 text-left transition-colors",
                                mode === option.id
                                    ? "bg-[var(--surface-2)]"
                                    : "hover:bg-[var(--surface-3)]",
                            ].join(" ")}
                        >
                            <span className="block text-[12px] font-semibold text-[var(--ink)]">
                                {option.label}
                            </span>

                            <span className="mt-0.5 block text-[12px] text-[var(--faint)]">
                                {option.hint}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            <div className="space-y-2">
                {questions.map((question, questionIndex) => {
                    const isSelected = selected.has(questionIndex);
                    const warning = warningByIndex.get(questionIndex);

                    return (
                        <article
                            key={questionIndex}
                            className={[
                                "rounded-2xl border p-3",
                                isSelected
                                    ? "border-[var(--line)] bg-[var(--surface)]"
                                    : "border-dashed border-[var(--line)] bg-[var(--surface-3)] opacity-60",
                            ].join(" ")}
                        >
                            <div className="flex items-start gap-2.5">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() =>
                                        toggleQuestion(questionIndex)
                                    }
                                    aria-label={`Chọn câu ${questionIndex + 1}`}
                                    className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--brand-solid)]"
                                />

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--faint)]">
                                            Câu {questionIndex + 1}
                                        </span>

                                        {warning && (
                                            <span className="rounded-full bg-[var(--surface-2)] px-1.5 py-0.5 text-[12px] font-medium text-[var(--muted)]">
                                                Cần kiểm tra
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-1 whitespace-pre-line text-[13px] font-medium leading-6 text-[var(--ink)]">
                                        {question.content}
                                    </p>

                                    <div
                                        role="radiogroup"
                                        aria-label={`Đáp án đúng của câu ${questionIndex + 1}`}
                                        className="mt-2 space-y-1"
                                    >
                                        {question.options.map(
                                            (option, optionIndex) => {
                                                const isCorrect =
                                                    option.isCorrect;

                                                return (
                                                    <button
                                                        key={optionIndex}
                                                        type="button"
                                                        role="radio"
                                                        aria-checked={
                                                            isCorrect
                                                        }
                                                        disabled={
                                                            !isSelected
                                                        }
                                                        onClick={() =>
                                                            chooseCorrect(
                                                                questionIndex,
                                                                optionIndex
                                                            )
                                                        }
                                                        className={[
                                                            "flex w-full items-start gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors",
                                                            isCorrect
                                                                ? "border-[var(--success)]/40 bg-[var(--success-soft)]"
                                                                : "border-transparent hover:bg-[var(--surface-3)]",
                                                            isSelected
                                                                ? ""
                                                                : "cursor-not-allowed",
                                                        ].join(" ")}
                                                    >
                                                        <span
                                                            className={[
                                                                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold",
                                                                isCorrect
                                                                    ? "bg-[var(--success)] text-white"
                                                                    : "bg-[var(--surface-2)] text-[var(--muted)]",
                                                            ].join(" ")}
                                                        >
                                                            {optionLabel(
                                                                optionIndex
                                                            )}
                                                        </span>

                                                        <span className="min-w-0 flex-1 whitespace-pre-line text-[12px] leading-5 text-[var(--ink-2)]">
                                                            {option.content}
                                                        </span>

                                                        {isCorrect && (
                                                            <Check
                                                                size={14}
                                                                className="mt-0.5 shrink-0 text-[var(--success)]"
                                                            />
                                                        )}
                                                    </button>
                                                );
                                            }
                                        )}
                                    </div>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center sm:px-4">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="quiz-import-title"
                className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[var(--surface)] shadow-xl sm:h-auto sm:max-h-[88dvh] sm:max-w-3xl sm:rounded-3xl sm:border sm:border-[var(--line)]"
            >
                <div className="flex shrink-0 items-center gap-3 border-b border-[var(--line)] px-4 py-3.5 sm:px-5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-text)]">
                        <FileUp size={17} strokeWidth={1.8} />
                    </span>

                    <div className="min-w-0 flex-1">
                        <h2
                            id="quiz-import-title"
                            className="text-[14px] font-semibold text-[var(--ink)]"
                        >
                            Nhập đề từ file
                        </h2>

                        <p className="mt-0.5 text-[12px] text-[var(--faint)]">
                            .txt, .docx · tiếng Việt và tiếng Lào
                        </p>
                    </div>

                    <button
                        ref={closeRef}
                        type="button"
                        onClick={onClose}
                        disabled={importing}
                        aria-label="Đóng"
                        className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--faint)] transition hover:bg-[var(--surface-2)] hover:text-[var(--ink)] disabled:opacity-50"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
                    {errorMessage && (
                        <p
                            role="alert"
                            className="mb-3 rounded-xl border border-[var(--danger-soft)] bg-[var(--danger-soft)] px-3 py-2 text-[12px] leading-5 text-[var(--danger)]"
                        >
                            {errorMessage}
                        </p>
                    )}

                    {step === "source" && renderSource()}
                    {step === "preview" && renderPreview()}
                </div>

                <div className="shrink-0 border-t border-[var(--line)] bg-[var(--surface)] px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 sm:px-5 sm:pb-3">
                    {step === "preview" ? (
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <p className="text-[12px] text-[var(--muted)]">
                                    Đã chọn{" "}
                                    <strong className="font-semibold text-[var(--ink)]">
                                        {selectedQuestions.length}
                                    </strong>{" "}
                                    câu
                                </p>

                                {overLimit && (
                                    <p className="mt-0.5 text-[12px] text-[var(--danger)]">
                                        Đề tối đa {MAX_QUESTIONS} câu,
                                        còn {availableSlots} chỗ trống.
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={importing}
                                    className="h-10 flex-1 rounded-full border border-[var(--line)] px-3 text-[12px] font-medium text-[var(--muted)] transition hover:bg-[var(--surface-3)] disabled:opacity-50 sm:flex-none"
                                >
                                    Hủy
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={
                                        importing ||
                                        overLimit ||
                                        selectedQuestions.length ===
                                            0
                                    }
                                    className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-[var(--brand-solid)] px-4 text-[12px] font-semibold text-white transition hover:bg-[var(--brand-solid-hover)] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                                >
                                    {importing && (
                                        <Loader2
                                            size={14}
                                            className="animate-spin"
                                        />
                                    )}

                                    {importing
                                        ? "Đang lưu..."
                                        : `Nhập ${selectedQuestions.length} câu`}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-[12px] text-[var(--faint)]">
                                Nội dung chỉ được xử lý trên
                                thiết bị của bạn.
                            </p>

                            <button
                                type="button"
                                onClick={onClose}
                                className="h-10 shrink-0 rounded-full border border-[var(--line)] px-3 text-[12px] font-medium text-[var(--muted)] transition hover:bg-[var(--surface-3)]"
                            >
                                Đóng
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizImportStudio;
