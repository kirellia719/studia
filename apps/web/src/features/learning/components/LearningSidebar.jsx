import { Check } from "lucide-react";

import LessonList from "@/features/learning/components/LessonList.jsx";

const LearningSidebar = ({
    lessons = [],
    selectedLessonId,
    onSelectLesson,
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
        <section className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-sm">
            <div className="border-b border-[var(--line)] px-4 py-4">
                <div className="flex items-center gap-2">
                    <h2 className="min-w-0 flex-1 text-[14px] font-semibold text-[var(--ink)]">
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

                <div className="mt-1 flex items-center justify-between text-[12px]">
                    <span className="text-[var(--muted)]">
                        {completedCount}/{totalLessons} bài
                    </span>

                    <span
                        className={[
                            "font-semibold tabular-nums",
                            isCourseCompleted
                                ? "text-[var(--success)]"
                                : "text-[var(--brand-text)]",
                        ].join(" ")}
                    >
                        {progress}%
                    </span>
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

            <div className="max-h-[max(160px,calc(100dvh-430px))] overflow-y-auto overscroll-contain">
                <LessonList
                    lessons={lessons}
                    selectedLessonId={selectedLessonId}
                    onSelectLesson={onSelectLesson}
                    busy={busy}
                />
            </div>
        </section>
    );
};

export default LearningSidebar;
