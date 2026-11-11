// src/pages/student/courses/learning/LessonDrawer.jsx

import {
    BookOpen,
    Check,
    ChevronRight,
    X,
} from "lucide-react";

import formatDuration from "@/lib/format/formatDuration.js";

const LessonDrawer = ({
    open,
    lessons,
    selectedLessonId,
    onSelectLesson,
    onClose,
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
                className={`
                    fixed
                    inset-0
                    z-40
                    bg-black/30
                    transition-opacity
                    duration-300
                    ${open
                        ? "pointer-events-auto opacity-100"
                        : "pointer-events-none opacity-0"
                    }
                `}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`
                    fixed
                    inset-x-0
                    bottom-0
                    z-50
                    mx-auto
                    w-full
                    max-w-2xl
                    rounded-t-xl
                    bg-[var(--surface)]
                    shadow-2xl
                    transition-transform
                    duration-300
                    ease-out
                    ${open
                        ? "translate-y-0"
                        : "translate-y-full"
                    }
                `}
            >
                {/* Header */}
                <div className="border-b border-[var(--line)] px-4 py-3.5">
                    <div className="flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-sm font-semibold text-[var(--ink)]">
                                    Danh sách bài học
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

                            <p className="mt-0.5 text-[11px] text-[var(--faint)]">
                                {isCourseCompleted
                                    ? "Đã hoàn thành toàn bộ khóa học"
                                    : `${completedCount} / ${totalLessons} bài đã hoàn thành`}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="
                                flex
                                h-8
                                w-8
                                shrink-0
                                items-center
                                justify-center
                                rounded-md
                                text-[var(--faint)]
                                transition
                                hover:bg-[var(--surface-2)]
                                hover:text-[var(--muted)]
                            "
                            aria-label="Đóng"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Progress */}
                    {totalLessons > 0 && (
                        <div className="mt-3">
                            <div className="mb-1.5 flex items-center justify-between">
                                <span className="text-[10px] font-medium text-[var(--faint)]">
                                    Tiến độ
                                </span>

                                <span
                                    className={`
                                        text-[10px]
                                        font-semibold
                                        ${isCourseCompleted
                                            ? "text-[var(--success)]"
                                            : "text-[var(--brand-strong)]"
                                        }
                                    `}
                                >
                                    {progress}%
                                </span>
                            </div>

                            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--brand-soft)]">
                                <div
                                    className={`
                                        h-full
                                        rounded-full
                                        transition-all
                                        duration-300
                                        ${isCourseCompleted
                                            ? "bg-[var(--success)]"
                                            : "bg-[var(--brand-solid)]"
                                        }
                                    `}
                                    style={{
                                        width: `${progress}%`,
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Lesson list */}
                <div className="max-h-[65vh] overflow-y-auto p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
                    {lessons.length === 0 ? (
                        <div className="px-4 py-10 text-center">
                            <BookOpen
                                size={30}
                                className="mx-auto mb-2 text-gray-300"
                            />

                            <p className="text-xs text-[var(--faint)]">
                                Khóa học chưa có bài học.
                            </p>
                        </div>
                    ) : (
                        lessons.map((lesson) => {
                            const isSelected =
                                selectedLessonId === lesson.id;

                            const isCompleted =
                                lesson.isCompleted;

                            const isLocked =
                                lesson.isLocked;

                            /*
                             * Bài hiện tại không được click lại.
                             * Bài bị khóa cũng không được click.
                             */
                            const isDisabled =
                                isSelected || isLocked;

                            return (
                                <button
                                    key={lesson.id}
                                    type="button"
                                    disabled={isDisabled}
                                    onClick={() =>
                                        onSelectLesson(lesson)
                                    }
                                    className={`
                                        mb-1
                                        flex
                                        w-full
                                        items-center
                                        gap-3
                                        rounded-md
                                        px-3
                                        py-3
                                        text-left
                                        transition
                                        last:mb-0

                                        ${isSelected
                                            ? "cursor-default bg-[var(--brand-soft)]"
                                            : "hover:bg-[var(--surface-3)]"
                                        }

                                        ${isLocked
                                            ? "cursor-not-allowed opacity-45"
                                            : ""
                                        }
                                    `}
                                >
                                    {/* Lesson status / number */}
                                    <div
                                        className={`
                                            flex
                                            h-8
                                            w-8
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-full
                                            text-xs
                                            font-semibold

                                            ${isCompleted
                                                ? "bg-[var(--success-soft)] text-[var(--success)]"
                                                : isSelected
                                                    ? "bg-[var(--brand-solid)] text-white"
                                                    : "bg-[var(--surface-2)] text-[var(--muted)]"
                                            }
                                        `}
                                    >
                                        {isCompleted ? (
                                            <Check
                                                size={15}
                                                strokeWidth={2.5}
                                            />
                                        ) : (
                                            lesson.order
                                        )}
                                    </div>

                                    {/* Lesson content */}
                                    <div className="min-w-0 flex-1">
                                        <p
                                            className={`
                                                min-w-0
                                                truncate
                                                text-sm
                                                font-medium
                                                ${isSelected
                                                    ? "text-[var(--brand-strong)]"
                                                    : "text-[var(--ink)]"
                                                }
                                            `}
                                        >
                                            {lesson.title}
                                        </p>

                                        <div className="mt-0.5 flex items-center gap-2">
                                            {lesson.duration !=
                                                null && (
                                                    <span className="text-[10px] text-[var(--faint)]">
                                                        {formatDuration(
                                                            lesson.duration
                                                        )}
                                                    </span>
                                                )}

                                            {isCompleted && (
                                                <span className="text-[11px] font-medium text-[var(--success)]">
                                                    Đã hoàn thành
                                                </span>
                                            )}

                                            {isLocked && (
                                                <span className="text-[10px] text-[var(--faint)]">
                                                    Đã khóa
                                                </span>
                                            )}

                                            {!isCompleted && isSelected && (
                                                <span className="text-[10px] font-medium text-[var(--brand-strong)]">
                                                    Đang học
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Arrow */}
                                    {!isLocked &&
                                        !isSelected && (
                                            <ChevronRight
                                                size={16}
                                                className="shrink-0 text-gray-300"
                                            />
                                        )}
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </>
    );
};

export default LessonDrawer;