import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Loader2,
    X,
} from "lucide-react";

import appToast from "@/lib/toast.js";
import quizApi from "@/features/quizzes/api.js";

import QuizResult from "@/features/quizzes/components/QuizResult.jsx";

const optionLabels = ["A", "B", "C", "D", "E", "F"];

const getErrorMessage = (error, fallback) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;

    if (status && status < 500 && message) {
        return message;
    }

    return fallback;
};

const QuizRunner = ({
    open,
    lesson,
    nextLesson,
    onClose,
    onFinished,
    onSelectNextLesson,
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [quiz, setQuiz] = useState(null);
    const [attemptId, setAttemptId] = useState(null);
    const [selections, setSelections] = useState({});
    const [index, setIndex] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [retrying, setRetrying] = useState(false);
    const [result, setResult] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);
    const persistQueueRef = useRef(Promise.resolve());

    const lessonId = lesson?.id;

    useEffect(() => {
        if (!open || !lessonId) return undefined;

        let active = true;

        const loadAttempt = async () => {
            try {
                setLoading(true);
                setError("");
                setResult(null);
                setIndex(0);
                setSelections({});

                const response =
                    await quizApi.startAttempt(lessonId);

                if (!active) return;

                const data = response?.data;

                if (!data?.quiz || !data?.attempt?.id) {
                    throw new Error(
                        "Dữ liệu đề ôn tập không hợp lệ."
                    );
                }

                setQuiz(data.quiz);
                setAttemptId(data.attempt.id);

                const savedSelections = {};

                (data.attempt.answers ?? []).forEach((answer) => {
                    if (answer.selectedOptionId) {
                        savedSelections[answer.questionId] =
                            answer.selectedOptionId;
                    }
                });

                setSelections(savedSelections);
            } catch (loadError) {
                if (!active) return;

                console.error(
                    "Start quiz attempt error:",
                    loadError
                );

                setQuiz(null);
                setAttemptId(null);
                setError(
                    getErrorMessage(
                        loadError,
                        "Không thể mở đề ôn tập."
                    )
                );
            } finally {
                if (active) {
                    setLoading(false);
                    setRetrying(false);
                }
            }
        };

        loadAttempt();

        return () => {
            active = false;
        };
    }, [open, lessonId, reloadKey]);

    useEffect(() => {
        if (!open) return undefined;

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [open]);

    if (!open) return null;

    const questions = quiz?.questions ?? [];
    const currentQuestion = questions[index];
    const answeredCount = questions.filter(
        (question) => selections[question.id] !== undefined
    ).length;

    const buildAnswers = (nextSelections) =>
        questions
            .filter(
                (question) =>
                    nextSelections[question.id] !== undefined
            )
            .map((question) => ({
                questionId: question.id,
                selectedOptionId:
                    nextSelections[question.id],
            }));

    // Xếp hàng các lần lưu để hai yêu cầu không chạy song song
    // và tạo ra đáp án trùng cho cùng một câu.
    const persist = (nextSelections) => {
        if (!attemptId || questions.length === 0) {
            return persistQueueRef.current;
        }

        const payload = buildAnswers(nextSelections);

        persistQueueRef.current =
            persistQueueRef.current.then(async () => {
                try {
                    await quizApi.saveAnswers(
                        attemptId,
                        payload
                    );
                } catch (persistError) {
                    console.error(
                        "Save quiz answers error:",
                        persistError
                    );
                }
            });

        return persistQueueRef.current;
    };

    const handleSelect = (questionId, optionId) => {
        const nextSelections = {
            ...selections,
            [questionId]: optionId,
        };

        setSelections(nextSelections);
        persist(nextSelections);
    };

    const handleClose = async () => {
        if (!result && attemptId) {
            await persist(selections);
        }

        onClose();
    };

    const handleSubmit = async () => {
        if (submitting) return;

        try {
            setSubmitting(true);

            await persist(selections);

            const response = await quizApi.submit(
                attemptId
            );

            setResult(response?.data ?? null);

            onFinished?.(response?.data ?? null);
        } catch (submitError) {
            console.error("Submit quiz error:", submitError);

            appToast.error(
                getErrorMessage(
                    submitError,
                    "Không thể nộp bài."
                )
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleRetry = () => {
        if (retrying) return;

        setRetrying(true);
        setReloadKey((value) => value + 1);
    };

    const handleNext = () => {
        if (!nextLesson || !onSelectNextLesson) return;

        onClose();
        onSelectNextLesson(nextLesson);
    };

    const isLastQuestion = index === questions.length - 1;
    const progress =
        questions.length > 0
            ? Math.round(((index + 1) / questions.length) * 100)
            : 0;

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-[var(--surface-3)] sm:items-center sm:justify-center sm:bg-black/50 sm:p-6">
            <div className="flex h-full w-full flex-col overflow-hidden bg-[var(--surface)] sm:h-auto sm:max-h-[88dvh] sm:max-w-2xl sm:rounded-3xl sm:shadow-xl">
                {/* Header */}
                <div className="shrink-0 border-b border-[var(--line)]">
                    <div className="flex items-center gap-2 px-3 py-2.5 sm:px-5">
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-[12px] font-medium text-[var(--faint)]">
                                Ôn tập cuối bài
                            </p>

                            <h2 className="truncate text-[14px] font-semibold text-[var(--ink)]">
                                {result
                                    ? "Kết quả bài làm"
                                    : quiz?.title ||
                                      lesson?.title ||
                                      "Trắc nghiệm"}
                            </h2>
                        </div>

                        {!result && questions.length > 0 && (
                            <span className="shrink-0 rounded-lg bg-[var(--surface-2)] px-2.5 py-1 text-[12px] font-semibold tabular-nums text-[var(--muted)]">
                                {index + 1}/{questions.length}
                            </span>
                        )}

                        <button
                            type="button"
                            onClick={handleClose}
                            aria-label="Đóng bài ôn tập"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {!result && !loading && questions.length > 0 && (
                        <div className="h-1 w-full bg-[var(--surface-2)]">
                            <div
                                className="h-full rounded-r-full bg-[var(--brand-solid)] transition-[width] duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    )}
                </div>

                {/* Body */}
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                    {loading ? (
                        <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-[var(--muted)]">
                            <Loader2
                                size={22}
                                className="animate-spin"
                            />

                            <p className="text-[13px]">
                                Đang mở đề ôn tập...
                            </p>
                        </div>
                    ) : error ? (
                        <div className="flex min-h-40 flex-col items-center justify-center text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--danger-soft)] text-[var(--danger)]">
                                <AlertCircle size={22} />
                            </div>

                            <p className="mt-3 text-[13px] font-medium text-[var(--ink)]">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    setReloadKey(
                                        (value) => value + 1
                                    )
                                }
                                className="mt-4 inline-flex h-11 items-center rounded-full border border-[var(--line)] px-4 text-[13px] font-medium text-[var(--muted)] transition hover:bg-[var(--surface-3)]"
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : result ? (
                        <QuizResult
                            key={result.id}
                            result={result}
                            retrying={retrying}
                            nextLesson={nextLesson}
                            onRetry={handleRetry}
                            onNext={handleNext}
                            onClose={handleClose}
                        />
                    ) : currentQuestion ? (
                        <div>
                            <span className="inline-flex h-7 items-center rounded-lg bg-[var(--brand-soft)] px-2.5 text-[12px] font-semibold tabular-nums text-[var(--brand-text)]">
                                Câu {index + 1}
                            </span>

                            <h3 className="mt-3 text-[16px] font-semibold leading-7 text-[var(--ink)] sm:text-[17px]">
                                {currentQuestion.content}
                            </h3>

                            <div className="mt-4 space-y-2.5">
                                {currentQuestion.options.map(
                                    (option, optionIndex) => {
                                        const selected =
                                            selections[
                                                currentQuestion.id
                                            ] === option.id;

                                        return (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() =>
                                                    handleSelect(
                                                        currentQuestion.id,
                                                        option.id
                                                    )
                                                }
                                                aria-pressed={selected}
                                                className={[
                                                    "flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition",
                                                    selected
                                                        ? "border-[var(--brand)] bg-[var(--brand-soft)]"
                                                        : "border-[var(--line)] bg-[var(--surface)] hover:border-[var(--brand)] hover:bg-[var(--surface-3)]",
                                                ].join(" ")}
                                            >
                                                <span
                                                    className={[
                                                        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold",
                                                        selected
                                                            ? "bg-[var(--brand-solid)] text-white"
                                                            : "bg-[var(--surface-2)] text-[var(--muted)]",
                                                    ].join(" ")}
                                                >
                                                    {
                                                        optionLabels[
                                                            optionIndex
                                                        ]
                                                    }
                                                </span>

                                                <span className="min-w-0 break-words text-[14px] leading-6 text-[var(--ink)]">
                                                    {option.content}
                                                </span>
                                            </button>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Footer */}
                {!result && !loading && !error && currentQuestion && (
                    <div className="shrink-0 border-t border-[var(--line)] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-6">
                        <div className="flex items-center justify-between gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    persist(selections);
                                    setIndex((value) =>
                                        Math.max(0, value - 1)
                                    );
                                }}
                                disabled={index === 0}
                                className="inline-flex h-11 items-center gap-1 rounded-full border border-[var(--line)] px-3 text-[13px] font-medium text-[var(--muted)] transition hover:bg-[var(--surface-3)] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft size={16} />
                                Trước
                            </button>

                            <span className="text-[12px] tabular-nums text-[var(--faint)]">
                                Đã trả lời {answeredCount}/
                                {questions.length}
                            </span>

                            {isLastQuestion ? (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="inline-flex h-11 items-center gap-1 rounded-full bg-[var(--brand-solid)] px-4 text-[13px] font-semibold text-white transition hover:bg-[var(--brand-solid-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {submitting
                                        ? "Đang nộp..."
                                        : "Nộp bài"}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => {
                                        persist(selections);
                                        setIndex((value) =>
                                            Math.min(
                                                questions.length - 1,
                                                value + 1
                                            )
                                        );
                                    }}
                                    className="inline-flex h-11 items-center gap-1 rounded-full bg-[var(--brand-solid)] px-4 text-[13px] font-semibold text-white transition hover:bg-[var(--brand-solid-hover)]"
                                >
                                    Tiếp
                                    <ChevronRight size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default QuizRunner;
