import { Check, X } from "lucide-react";

import LessonList from "@/features/learning/components/LessonList.jsx";

const LessonDrawer = ({
    open,
    lessons,
    selectedLessonId,
    onSelectLesson,
    onClose,
    busy = false,
}) => {
    const completedCount = lessons.filter(
        (lesson) => lesson.isCompleted
    ).length;

    const totalLessons = lessons.length;

    const isCourseCompleted =
        totalLessons > 0 &&
        completedCount === totalLessons;

    const progress =
        totalLessons > 0
            ? Math.round(
                (completedCount / totalLessons) * 100
            )
            : 0;

    return (
        <>
            {/* Backdrop */}
            <div
                aria-hidden="true"
                onClick={onClose}
                className={[
                    "fixed inset-0 z-40 bg-black/30 lg:hidden",
                    "transition-opacity duration-300",
                    open
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-0",
                ].join(" ")}
            />

            {/* Drawer */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Nội dung khóa học"
                aria-hidden={!open}
                inert={!open}
                className={[
                    "fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-2xl",
                    "rounded-t-3xl bg-[var(--surface)] shadow-2xl lg:hidden",
                    "transition-transform duration-300 ease-out",
                    open
                        ? "translate-y-0"
                        : "translate-y-full",
                ].join(" ")}
            >
                {/* Tay nắm */}
                <div className="flex justify-center pb-1 pt-2">
                    <span
                        aria-hidden="true"
                        className="h-1 w-10 rounded-full bg-[var(--line)]"
                    />
                </div>

                {/* Header */}
                <div className="border-b border-[var(--line)] px-4 pb-3 pt-1">
                    <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-[15px] font-semibold text-[var(--ink)]">
                                    Nội dung khóa học
                                </h2>

                                {isCourseCompleted && (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--success-soft)] text-[var(--success)]">
                                        <Check
                                            size={12}
                                            strokeWidth={2.5}
                                        />
                                    </span>
                                )}
                            </div>

                            <p className="mt-0.5 text-[12px] text-[var(--muted)]">
                                {completedCount}/
                                {totalLessons} bài · {progress}%
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Đóng"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--faint)] transition hover:bg-[var(--surface-2)] hover:text-[var(--ink-2)]"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div
                        role="progressbar"
                        aria-label="Tiến độ khóa học"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={progress}
                        className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--brand-soft)]"
                    >
                        <div
                            className={[
                                "h-full rounded-full transition-all duration-300",
                                isCourseCompleted
                                    ? "bg-[var(--success)]"
                                    : "bg-[var(--brand-solid)]",
                            ].join(" ")}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Danh sách */}
                <div className="max-h-[62vh] overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
                    <LessonList
                        lessons={lessons}
                        selectedLessonId={
                            selectedLessonId
                        }
                        onSelectLesson={onSelectLesson}
                        busy={busy}
                    />
                </div>
            </div>
        </>
    );
};

export default LessonDrawer;
