import { CheckCircle2, ListChecks } from "lucide-react";

const QuizCard = ({ quiz, starting, onStart }) => {
    if (!quiz) return null;

    const hasBestScore = quiz.bestScore !== null;

    const passed =
        hasBestScore &&
        quiz.bestScore >= quiz.passingScore;

    return (
        <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-sm">
            <div className="flex items-center justify-between gap-2 border-b border-[var(--surface-2)] px-4 py-3.5 sm:px-5">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand-tint)] text-[var(--brand-text)]">
                        <ListChecks size={16} strokeWidth={1.8} />
                    </div>

                    <h2 className="text-[13px] font-semibold text-[var(--ink)]">
                        Ôn tập cuối bài
                    </h2>
                </div>

                {hasBestScore && (
                    <span
                        className={[
                            "inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-[12px] font-semibold tabular-nums",
                            passed
                                ? "bg-[var(--success-soft)] text-[var(--success)]"
                                : "bg-[var(--surface-2)] text-[var(--muted)]",
                        ].join(" ")}
                    >
                        {passed && <CheckCircle2 size={12} />}

                        {quiz.bestScore}%
                    </span>
                )}
            </div>

            <div className="p-4 sm:p-5">
                <h3 className="text-[14px] font-semibold text-[var(--ink)]">
                    {quiz.title}
                </h3>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex h-7 items-center rounded-full bg-[var(--surface-2)] px-2.5 text-[12px] font-medium text-[var(--muted)]">
                        {quiz.totalQuestions} câu hỏi
                    </span>

                    <span className="inline-flex h-7 items-center rounded-full bg-[var(--surface-2)] px-2.5 text-[12px] font-medium text-[var(--muted)]">
                        Điểm đạt {quiz.passingScore}%
                    </span>

                    {!hasBestScore && (
                        <span className="inline-flex h-7 items-center rounded-full bg-[var(--brand-tint)] px-2.5 text-[12px] font-medium text-[var(--brand-text)]">
                            Chưa làm lần nào
                        </span>
                    )}
                </div>

                <button
                    type="button"
                    onClick={onStart}
                    disabled={starting}
                    className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-full bg-[var(--brand-solid)] px-5 text-[13px] font-semibold text-white transition hover:bg-[var(--brand-solid-hover)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                    {starting
                        ? "Đang mở đề..."
                        : hasBestScore
                            ? "Làm lại bài ôn tập"
                            : "Bắt đầu ôn tập"}
                </button>
            </div>
        </section>
    );
};

export default QuizCard;
