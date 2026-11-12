import { useState } from "react";

import {
    ArrowRight,
    CheckCircle2,
    ChevronDown,
    MinusCircle,
    RotateCcw,
    XCircle,
} from "lucide-react";

const QuizResult = ({
    result,
    retrying,
    nextLesson,
    onRetry,
    onNext,
    onClose,
}) => {
    const answers = result.answers ?? [];
    const total = result.totalQuestions || answers.length;

    const correctCount = answers.filter(
        (answer) => answer.isCorrect
    ).length;

    const unansweredCount = answers.filter(
        (answer) => !answer.selectedOptionId
    ).length;

    const wrongCount = Math.max(
        total - correctCount - unansweredCount,
        0
    );

    const [expanded, setExpanded] = useState(
        () =>
            new Set(
                answers
                    .filter((answer) => !answer.isCorrect)
                    .map((answer) => answer.questionId)
            )
    );

    const toggleAnswer = (questionId) => {
        setExpanded((prev) => {
            const next = new Set(prev);

            if (next.has(questionId)) {
                next.delete(questionId);
            } else {
                next.add(questionId);
            }

            return next;
        });
    };

    return (
        <div className="space-y-4">
            {/* Tổng kết */}
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-3)] px-4 py-5 text-center sm:px-6">
                <div
                    className="mx-auto flex h-28 w-28 items-center justify-center rounded-full"
                    style={{
                        background: `conic-gradient(${
                            result.passed
                                ? "var(--success)"
                                : "var(--danger)"
                        } ${result.score * 3.6}deg, var(--surface-2) 0deg)`,
                    }}
                >
                    <div
                        className={[
                            "flex h-[104px] w-[104px] flex-col items-center justify-center rounded-full bg-[var(--surface)]",
                            result.passed
                                ? "text-[var(--success)]"
                                : "text-[var(--danger)]",
                        ].join(" ")}
                    >
                        <span className="text-[28px] font-bold tabular-nums leading-none">
                            {result.score}%
                        </span>

                        <span className="mt-1 text-[12px] font-medium text-[var(--muted)]">
                            điểm
                        </span>
                    </div>
                </div>

                <h3 className="mt-4 text-[15px] font-semibold text-[var(--ink)]">
                    {result.passed
                        ? "Bạn đã đạt yêu cầu"
                        : "Chưa đạt yêu cầu"}
                </h3>

                <p className="mt-1 text-[12px] leading-5 text-[var(--muted)]">
                    Đúng {correctCount}/{total} câu · Điểm
                    đạt {result.passingScore}%
                </p>

                <div className="mx-auto mt-4 grid max-w-sm grid-cols-3 gap-2">
                    {[
                        {
                            label: "Đúng",
                            value: correctCount,
                            tone: "text-[var(--success)]",
                            bg: "bg-[var(--success-soft)]",
                        },
                        {
                            label: "Sai",
                            value: wrongCount,
                            tone: "text-[var(--danger)]",
                            bg: "bg-[var(--danger-soft)]",
                        },
                        {
                            label: "Bỏ trống",
                            value: unansweredCount,
                            tone: "text-[var(--muted)]",
                            bg: "bg-[var(--surface-2)]",
                        },
                    ].map((item) => (
                        <div
                            key={item.label}
                            className={`rounded-xl px-2 py-2 ${item.bg}`}
                        >
                            <p
                                className={`text-[16px] font-bold tabular-nums leading-none ${item.tone}`}
                            >
                                {item.value}
                            </p>

                            <p className="mt-1 text-[12px] font-medium text-[var(--muted)]">
                                {item.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Xem lại */}
            <div>
                <div className="mb-2 flex items-baseline justify-between gap-2 px-0.5">
                    <h4 className="text-[13px] font-semibold text-[var(--ink)]">
                        Xem lại bài làm
                    </h4>

                    <span className="text-[12px] text-[var(--faint)]">
                        Chạm vào câu để xem đáp án
                    </span>
                </div>

                <div className="space-y-2">
                    {answers.map((answer, index) => {
                        const unanswered =
                            !answer.selectedOptionId;

                        const isOpen = expanded.has(
                            answer.questionId
                        );

                        return (
                            <div
                                key={answer.questionId}
                                className={[
                                    "overflow-hidden rounded-xl border transition",
                                    answer.isCorrect
                                        ? "border-[var(--success-soft)] bg-[var(--success-soft)]"
                                        : "border-[var(--surface-2)] bg-[var(--surface-3)]",
                                ].join(" ")}
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        toggleAnswer(
                                            answer.questionId
                                        )
                                    }
                                    aria-expanded={isOpen}
                                    className="flex w-full items-start gap-2.5 px-3 py-3 text-left"
                                >
                                    <span className="mt-0.5 shrink-0">
                                        {answer.isCorrect ? (
                                            <CheckCircle2
                                                size={17}
                                                className="text-[var(--success)]"
                                            />
                                        ) : unanswered ? (
                                            <MinusCircle
                                                size={17}
                                                className="text-[var(--faint)]"
                                            />
                                        ) : (
                                            <XCircle
                                                size={17}
                                                className="text-[var(--danger)]"
                                            />
                                        )}
                                    </span>

                                    <span className="min-w-0 flex-1">
                                        <span className="block text-[12px] font-semibold uppercase tracking-wide text-[var(--faint)]">
                                            Câu {index + 1}
                                        </span>

                                        <span className="mt-0.5 block text-[13px] font-medium leading-6 text-[var(--ink)]">
                                            {answer.questionContent}
                                        </span>

                                        {!isOpen && (
                                            <span
                                                className={[
                                                    "mt-1 block truncate text-[12px] font-medium",
                                                    answer.isCorrect
                                                        ? "text-[var(--success)]"
                                                        : unanswered
                                                            ? "text-[var(--muted)]"
                                                            : "text-[var(--danger)]",
                                                ].join(" ")}
                                            >
                                                {answer.isCorrect
                                                    ? "Trả lời đúng"
                                                    : unanswered
                                                        ? "Chưa trả lời"
                                                        : `Bạn chọn: ${
                                                            answer.selectedContent
                                                        }`}
                                            </span>
                                        )}
                                    </span>

                                    <ChevronDown
                                        size={16}
                                        className={[
                                            "mt-1 shrink-0 text-[var(--faint)] transition-transform",
                                            isOpen
                                                ? "rotate-180"
                                                : "",
                                        ].join(" ")}
                                    />
                                </button>

                                {isOpen && (
                                    <div className="space-y-2 border-t border-[var(--line)] px-3 pb-3 pt-2.5">
                                        <p
                                            className={[
                                                "text-[12px] leading-5",
                                                answer.isCorrect
                                                    ? "text-[var(--success)]"
                                                    : "text-[var(--danger)]",
                                            ].join(" ")}
                                        >
                                            Bạn chọn:{" "}
                                            {answer.selectedContent ??
                                                "Không trả lời"}
                                        </p>

                                        {!answer.isCorrect && (
                                            <p className="text-[12px] leading-5 text-[var(--success)]">
                                                Đáp án đúng:{" "}
                                                {answer.correctContent}
                                            </p>
                                        )}

                                        {answer.explanation && (
                                            <p className="rounded-lg bg-[var(--surface)] px-2.5 py-2 text-[12px] leading-5 text-[var(--muted)]">
                                                {answer.explanation}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Hành động */}
            <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-end">
                <button
                    type="button"
                    onClick={onClose}
                    className="order-3 inline-flex h-11 items-center justify-center rounded-full border border-[var(--line)] px-4 text-[13px] font-medium text-[var(--muted)] transition hover:bg-[var(--surface-3)] sm:order-1"
                >
                    Đóng
                </button>

                <button
                    type="button"
                    onClick={onRetry}
                    disabled={retrying}
                    className="order-2 inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-[13px] font-semibold text-[var(--ink)] transition hover:border-[var(--brand)] hover:text-[var(--brand-text)] disabled:cursor-not-allowed disabled:opacity-60 sm:order-2"
                >
                    <RotateCcw size={15} />
                    {retrying ? "Đang mở đề..." : "Làm lại"}
                </button>

                {nextLesson && (
                    <button
                        type="button"
                        onClick={onNext}
                        className="order-1 inline-flex min-h-11 items-center gap-3 rounded-xl bg-[var(--brand-solid)] px-4 py-2.5 text-left text-white transition hover:bg-[var(--brand-solid-hover)] sm:order-3"
                    >
                        <span className="min-w-0 flex-1">
                            <span className="block text-[12px] font-medium uppercase tracking-wide text-white/75">
                                Bài tiếp theo
                            </span>

                            <span className="mt-0.5 block truncate text-[13px] font-semibold sm:max-w-[180px]">
                                {nextLesson.title}
                            </span>
                        </span>

                        <ArrowRight
                            size={17}
                            className="shrink-0"
                        />
                    </button>
                )}
            </div>
        </div>
    );
};

export default QuizResult;
