import { ChevronLeft, ChevronRight } from "lucide-react";

const LessonNavigation = ({
    previousLesson,
    nextLesson,
    currentCompleted,
    busy = false,
    onSelectLesson,
}) => {
    if (!previousLesson && !nextLesson) return null;

    return (
        <nav
            aria-label="Chuyển bài học"
            className="flex flex-col gap-2 sm:flex-row sm:items-stretch"
        >
            {previousLesson && (
                <button
                    type="button"
                    onClick={() => onSelectLesson(previousLesson)}
                    disabled={busy}
                    className="group flex min-h-[60px] flex-1 items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-3 text-left transition hover:border-[var(--brand)] hover:bg-[var(--surface-3)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--muted)] transition group-hover:bg-[var(--brand-soft)] group-hover:text-[var(--brand-text)]">
                        <ChevronLeft size={18} />
                    </span>

                    <span className="min-w-0 flex-1">
                        <span className="block text-[12px] font-medium text-[var(--faint)]">
                            Bài trước
                        </span>

                        <span className="mt-0.5 block truncate text-[13px] font-semibold text-[var(--ink)]">
                            {previousLesson.title}
                        </span>
                    </span>
                </button>
            )}

            {nextLesson && (
                <button
                    type="button"
                    onClick={() => onSelectLesson(nextLesson)}
                    disabled={busy}
                    className={[
                        "group flex min-h-[60px] flex-1 items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60",
                        currentCompleted
                            ? "border-[var(--brand-solid)] bg-[var(--brand-solid)] text-white hover:bg-[var(--brand-solid-hover)]"
                            : "border-[var(--brand-soft)] bg-[var(--brand-tint)] hover:border-[var(--brand)]",
                    ].join(" ")}
                >
                    <span className="min-w-0 flex-1">
                        <span
                            className={[
                                "block text-[12px] font-medium",
                                currentCompleted
                                    ? "text-white/75"
                                    : "text-[var(--brand-text)]",
                            ].join(" ")}
                        >
                            Bài tiếp theo
                        </span>

                        <span
                            className={[
                                "mt-0.5 block truncate text-[13px] font-semibold",
                                currentCompleted
                                    ? "text-white"
                                    : "text-[var(--brand-text)]",
                            ].join(" ")}
                        >
                            {nextLesson.title}
                        </span>
                    </span>

                    <span
                        className={[
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition",
                            currentCompleted
                                ? "bg-white/15 text-white"
                                : "bg-[var(--surface)] text-[var(--brand-text)]",
                        ].join(" ")}
                    >
                        <ChevronRight size={18} />
                    </span>
                </button>
            )}
        </nav>
    );
};

export default LessonNavigation;
