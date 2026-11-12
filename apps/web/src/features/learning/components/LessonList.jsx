import {
    BookOpen,
    Check,
    ChevronRight,
    LockKeyhole,
} from "lucide-react";

import formatDuration from "@/lib/format/formatDuration.js";

const LessonList = ({
    lessons = [],
    selectedLessonId,
    onSelectLesson,
    busy = false,
}) => {
    if (lessons.length === 0) {
        return (
            <div className="px-4 py-10 text-center">
                <BookOpen
                    size={28}
                    strokeWidth={1.5}
                    className="mx-auto text-gray-300"
                />

                <p className="mt-2 text-[13px] text-[var(--faint)]">
                    Khóa học chưa có bài học.
                </p>
            </div>
        );
    }

    return (
        <div
            aria-busy={busy}
            className={[
                "divide-y divide-[var(--surface-2)]",
                busy
                    ? "pointer-events-none opacity-60"
                    : "",
            ].join(" ")}
        >
            {lessons.map((lesson) => {
                const isSelected =
                    selectedLessonId === lesson.id;

                const isCompleted = lesson.isCompleted;

                // Bài không miễn phí chỉ mở khi đã
                // đăng ký khóa học (API trả isLocked).
                const isLocked = Boolean(lesson.isLocked);

                const isDisabled = isSelected || isLocked;

                return (
                    <button
                        key={lesson.id}
                        type="button"
                        disabled={isDisabled || busy}
                        aria-current={
                            isSelected ? "true" : undefined
                        }
                        onClick={() => onSelectLesson(lesson)}
                        className={[
                            "flex min-h-[60px] w-full items-center gap-3",
                            "px-3 py-3 text-left transition",
                            isSelected
                                ? "cursor-default bg-[var(--brand-tint)]"
                                : "hover:bg-[var(--surface-3)]",
                            isLocked
                                ? "cursor-not-allowed opacity-45"
                                : "",
                        ].join(" ")}
                    >
                        {/* Số thứ tự / trạng thái */}
                        <span
                            className={[
                                "flex h-8 w-8 shrink-0 items-center justify-center",
                                "rounded-lg text-[12px] font-semibold tabular-nums",
                                isCompleted
                                    ? "bg-[var(--success-soft)] text-[var(--success)]"
                                    : isSelected
                                        ? "bg-[var(--brand-solid)] text-white"
                                        : "bg-[var(--surface-2)] text-[var(--muted)]",
                            ].join(" ")}
                        >
                            {isCompleted ? (
                                <Check
                                    size={15}
                                    strokeWidth={2.5}
                                />
                            ) : isLocked ? (
                                <LockKeyhole size={14} />
                            ) : (
                                String(
                                    lesson.order ?? ""
                                ).padStart(2, "0")
                            )}
                        </span>

                        {/* Nội dung */}
                        <span className="min-w-0 flex-1">
                            <span
                                className={[
                                    "block truncate text-[13px] font-medium",
                                    isSelected
                                        ? "text-[var(--brand-text)]"
                                        : "text-[var(--ink)]",
                                ].join(" ")}
                            >
                                {lesson.title}
                            </span>

                            <span className="mt-0.5 flex items-center gap-2 text-[12px]">
                                {lesson.duration != null && (
                                    <span className="text-[var(--faint)]">
                                        {formatDuration(
                                            lesson.duration
                                        )}
                                    </span>
                                )}

                                {isCompleted && (
                                    <span className="font-medium text-[var(--success)]">
                                        Đã hoàn thành
                                    </span>
                                )}

                                {isLocked && (
                                    <span className="text-[var(--faint)]">
                                        Cần đăng ký
                                    </span>
                                )}

                                {!isCompleted &&
                                    isSelected && (
                                        <span className="font-medium text-[var(--brand-text)]">
                                            Đang học
                                        </span>
                                    )}
                            </span>
                        </span>

                        {/* Mũi tên */}
                        {!isLocked && !isSelected && (
                            <ChevronRight
                                size={16}
                                className="shrink-0 text-gray-300"
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default LessonList;
