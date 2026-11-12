import { useCallback, useEffect, useRef, useState } from "react";

import { ListChecks, Trash2, X } from "lucide-react";

import appToast from "@/lib/toast.js";
import quizApi from "@/features/quizzes/api.js";

import QuizForm from "@/features/quizzes/components/QuizForm.jsx";
import QuizImportStudio from "@/features/quizzes/components/QuizImportStudio.jsx";

const SettingSwitch = ({ checked, disabled, label, onChange }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onChange}
        disabled={disabled}
        className="flex h-11 w-12 shrink-0 items-center justify-center rounded-full transition hover:bg-[var(--surface-2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-40"
    >
        <span
            className={[
                "flex h-6 w-11 items-center rounded-full p-0.5 transition-colors",
                checked
                    ? "bg-[var(--brand-solid)]"
                    : "border border-[var(--line)] bg-[var(--surface-2)]",
            ].join(" ")}
        >
            <span
                className={[
                    "h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                    checked ? "translate-x-5" : "translate-x-0",
                ].join(" ")}
            />
        </span>
    </button>
);

const DeleteQuizModal = ({
    open,
    deleting,
    onClose,
    onConfirm,
}) => {
    if (!open) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-quiz-title"
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center sm:px-4"
            onMouseDown={(event) => {
                if (
                    event.target === event.currentTarget &&
                    !deleting
                ) {
                    onClose();
                }
            }}
        >
            <div
                className="w-full max-w-[420px] rounded-t-3xl border border-[var(--line)] bg-[var(--surface)] shadow-xl sm:rounded-3xl"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="flex items-center gap-2 border-b border-[var(--line)] px-4 py-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--danger-soft)] text-[var(--danger)]">
                        <Trash2 size={16} strokeWidth={1.9} />
                    </span>

                    <h2
                        id="delete-quiz-title"
                        className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--ink)]"
                    >
                        Xóa đề trắc nghiệm?
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={deleting}
                        aria-label="Đóng"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--faint)] transition hover:bg-[var(--surface-2)] hover:text-[var(--ink-2)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="px-4 py-4">
                    <p className="text-[13px] leading-6 text-[var(--muted)]">
                        Đề ôn tập của bài học sẽ bị xóa vĩnh viễn,
                        kèm toàn bộ kết quả các lượt làm của
                        học sinh.
                    </p>
                </div>

                <div className="flex gap-2 border-t border-[var(--line)] px-4 py-3 pb-[calc(0.75rem_+_env(safe-area-inset-bottom))] sm:pb-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={deleting}
                        className="h-11 flex-1 rounded-full border border-[var(--line)] bg-[var(--surface)] text-[13px] font-medium text-[var(--muted)] transition hover:bg-[var(--surface-3)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Giữ lại
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={deleting}
                        className="h-11 flex-[1.4] rounded-full bg-[var(--danger-solid)] text-[13px] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {deleting ? "Đang xóa..." : "Xóa đề"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const QuizEditor = ({ lesson }) => {
    const lessonId = lesson?.id;

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const [importing, setImporting] = useState(false);
    const [formKey, setFormKey] = useState(0);
    const [formState, setFormState] = useState({
        dirty: false,
        count: 0,
        passing: 0,
    });

    const draftRef = useRef(null);

    const handleFormChange = useCallback((payload, dirty) => {
        draftRef.current = payload;

        const count = payload.questions.filter(
            (question) => question.content
        ).length;
        const passing = Number(payload.passingScore) || 0;

        setFormState((prev) =>
            prev.dirty === dirty &&
            prev.count === count &&
            prev.passing === passing
                ? prev
                : { dirty, count, passing }
        );
    }, []);

    useEffect(() => {
        if (!lessonId) return undefined;

        let active = true;

        const fetchQuiz = async () => {
            try {
                setLoading(true);
                setError("");

                const response =
                    await quizApi.getForTeacher(lessonId);

                if (!active) return;

                setQuiz(response?.data?.quiz ?? null);
            } catch (fetchError) {
                if (!active) return;

                console.error("Get quiz error:", fetchError);

                setError(
                    fetchError?.response?.data?.message ||
                    "Không thể tải đề trắc nghiệm."
                );
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchQuiz();

        return () => {
            active = false;
        };
    }, [lessonId]);

    const syncCompletionRequirement = async (savedQuiz) => {
        if (!savedQuiz?.isPublished) return;

        const required = Number(savedQuiz.passingScore) > 0;

        if (
            Boolean(savedQuiz.requiresPassForCompletion) ===
            required
        ) {
            return;
        }

        try {
            await quizApi.setRequiresPassForCompletion(
                lessonId,
                required
            );

            setQuiz((prev) => ({
                ...prev,
                requiresPassForCompletion: required,
            }));
        } catch (requirementError) {
            console.error(
                "Sync quiz requirement error:",
                requirementError
            );

            appToast.error(
                requirementError?.response?.data?.message ||
                "Không thể cập nhật yêu cầu hoàn thành bài."
            );
        }
    };

    const handleSave = async (payload) => {
        try {
            setSaving(true);

            const response = await quizApi.save(
                lessonId,
                payload
            );

            const savedQuiz = response?.data ?? null;

            setQuiz(savedQuiz);

            await syncCompletionRequirement(savedQuiz);

            appToast.success("Lưu đề trắc nghiệm thành công.");

            return true;
        } catch (saveError) {
            console.error("Save quiz error:", saveError);

            appToast.error(
                saveError?.response?.data?.message ||
                "Không thể lưu đề trắc nghiệm."
            );

            return false;
        } finally {
            setSaving(false);
        }
    };

    const handleImport = async (importedQuestions, mode) => {
        const draft = draftRef.current;

        if (!draft) return;

        try {
            setImporting(true);

            const keptQuestions = draft.questions.filter(
                (question) => question.content
            );

            const response = await quizApi.save(lessonId, {
                ...draft,
                questions:
                    mode === "append"
                        ? [...keptQuestions, ...importedQuestions]
                        : importedQuestions,
            });

            const savedQuiz = response?.data ?? null;

            setQuiz(savedQuiz);
            setImportOpen(false);
            setFormKey((key) => key + 1);

            await syncCompletionRequirement(savedQuiz);

            appToast.success(
                `Đã nhập ${importedQuestions.length} câu hỏi vào đề.`
            );
        } catch (importError) {
            console.error("Import quiz error:", importError);

            appToast.error(
                importError?.response?.data?.message ||
                "Không thể nhập đề từ file."
            );
        } finally {
            setImporting(false);
        }
    };

    const handleTogglePublish = async () => {
        if (publishing || saving) return;

        if (!quiz && !(draftRef.current && formState.dirty)) {
            appToast.error(
                "Hãy nhập câu hỏi và lưu đề trước khi mở cho học sinh."
            );
            return;
        }

        const nextValue = !quiz?.isPublished;

        try {
            setPublishing(true);

            let currentQuiz = quiz;

            if (draftRef.current && formState.dirty) {
                const saved = await quizApi.save(
                    lessonId,
                    draftRef.current
                );

                currentQuiz = saved?.data ?? currentQuiz;

                setQuiz(currentQuiz);
                setFormKey((key) => key + 1);
            }

            await quizApi.setPublished(lessonId, nextValue);

            const required =
                nextValue &&
                Number(currentQuiz?.passingScore) > 0;

            if (
                required &&
                !currentQuiz?.requiresPassForCompletion
            ) {
                await quizApi.setRequiresPassForCompletion(
                    lessonId,
                    true
                );
            }

            setQuiz((prev) => ({
                ...prev,
                isPublished: nextValue,
                requiresPassForCompletion: required,
            }));

            appToast.success(
                nextValue
                    ? "Đề đã mở cho học sinh."
                    : "Đề đã được tạm ẩn."
            );
        } catch (publishError) {
            console.error(
                "Publish quiz error:",
                publishError
            );

            appToast.error(
                publishError?.response?.data?.message ||
                "Không thể đổi trạng thái đề."
            );
        } finally {
            setPublishing(false);
        }
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);

            await quizApi.remove(lessonId);

            setQuiz(null);
            setConfirmDelete(false);
            setFormKey((key) => key + 1);

            appToast.success("Đã xóa đề trắc nghiệm.");
        } catch (deleteError) {
            console.error("Delete quiz error:", deleteError);

            appToast.error(
                deleteError?.response?.data?.message ||
                "Không thể xóa đề trắc nghiệm."
            );
        } finally {
            setDeleting(false);
        }
    };

    const isPublished = Boolean(quiz?.isPublished);

    const subtitle = loading
        ? "Đang tải đề..."
        : formState.dirty
            ? "Có thay đổi chưa lưu"
            : quiz
                ? `${formState.count} câu hỏi · ${formState.passing > 0
                    ? `Điểm đạt ${formState.passing}%`
                    : "Không bắt buộc đạt"
                }`
                : "Chưa có đề ôn tập";

    return (
        <>
            <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                <div className="flex items-center gap-3 border-b border-[var(--surface-2)] px-4 py-3.5 sm:px-5 sm:py-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--muted)]">
                        <ListChecks size={16} strokeWidth={1.8} />
                    </div>

                    <div className="min-w-0 flex-1">
                        <h2 className="text-[13px] font-semibold text-[var(--ink)]">
                            Trắc nghiệm ôn tập
                        </h2>

                        <p
                            className={[
                                "mt-0.5 truncate text-[12px]",
                                formState.dirty
                                    ? "font-medium text-[var(--accent)]"
                                    : "text-[var(--faint)]",
                            ].join(" ")}
                        >
                            {subtitle}
                        </p>
                    </div>

                    {quiz && (
                        <button
                            type="button"
                            onClick={() => setConfirmDelete(true)}
                            aria-label="Xóa đề trắc nghiệm"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--faint)] transition hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                        >
                            <Trash2 size={17} strokeWidth={1.9} />
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="space-y-2 p-4 sm:p-5">
                        <div className="h-10 animate-pulse rounded-xl bg-[var(--surface-2)]" />

                        <div className="h-24 animate-pulse rounded-xl bg-[var(--surface-2)]" />
                    </div>
                ) : error ? (
                    <p className="p-4 text-[13px] leading-6 text-[var(--danger)] sm:p-5">
                        {error}
                    </p>
                ) : (
                    <>
                        <div className="border-b border-[var(--surface-2)] bg-[var(--surface-3)]">
                            <div className="flex items-start justify-between gap-3 px-4 py-2.5 sm:px-5">
                                <div className="min-w-0 py-1">
                                    <p className="text-[12.5px] font-medium text-[var(--ink-2)]">
                                        Mở cho học sinh
                                    </p>

                                    <p
                                        className={[
                                            "mt-0.5 text-[12px] leading-4",
                                            isPublished
                                                ? "text-[var(--success)]"
                                                : "text-[var(--faint)]",
                                        ].join(" ")}
                                    >
                                        {!quiz
                                            ? "Thêm câu hỏi và lưu đề trước."
                                            : isPublished
                                                ? "Học sinh đang thấy đề này."
                                                : "Đề đang là bản nháp, học sinh chưa thấy."}
                                    </p>
                                </div>

                                <SettingSwitch
                                    checked={isPublished}
                                    disabled={
                                        publishing ||
                                        saving ||
                                        loading
                                    }
                                    label="Mở đề cho học sinh"
                                    onChange={handleTogglePublish}
                                />
                            </div>
                        </div>

                        <QuizForm
                            key={formKey}
                            quiz={quiz}
                            saving={saving}
                            onChange={handleFormChange}
                            onSubmit={handleSave}
                            onOpenImport={() =>
                                setImportOpen(true)
                            }
                        />
                    </>
                )}
            </section>

            <QuizImportStudio
                open={importOpen}
                onClose={() => setImportOpen(false)}
                onImport={handleImport}
                importing={importing}
                existingCount={formState.count}
            />

            <DeleteQuizModal
                open={confirmDelete}
                deleting={deleting}
                onClose={() => setConfirmDelete(false)}
                onConfirm={handleDelete}
            />
        </>
    );
};

export default QuizEditor;
