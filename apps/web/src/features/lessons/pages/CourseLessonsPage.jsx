import { useEffect, useState } from "react";

import {
    ChevronDown,
    ChevronUp,
    Clock3,
    Plus,
} from "lucide-react";

import {
    motion,
    AnimatePresence,
} from "framer-motion";

import {
    Link,
    useParams,
} from "react-router-dom";

import lessonApi from "@/features/lessons/api.js";
import appToast from "@/lib/toast.js";
import formatTime from "@/lib/format/formatTime.js";

const CourseLessonsPage = () => {
    const { courseId } = useParams();

    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);

    // Lesson đang reorder
    const [reorderingId, setReorderingId] = useState(null);

    // ==========================================
    // Fetch lessons
    // ==========================================

    useEffect(() => {
        const fetchLessons = async () => {
            if (!courseId) {
                return;
            }

            try {
                setLoading(true);

                const response =
                    await lessonApi.getLessonsByCourse(
                        courseId
                    );

                const lessonList =
                    response?.data || [];

                setLessons(
                    [...lessonList].sort(
                        (a, b) =>
                            (a.order ?? 0) -
                            (b.order ?? 0)
                    )
                );
            } catch (error) {
                console.error(
                    "Get lessons error:",
                    error
                );

                appToast.error(
                    error?.response?.data?.message ||
                    "Không thể tải danh sách bài học."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchLessons();
    }, [courseId]);

    // ==========================================
    // Reorder lesson
    // ==========================================

    const handleMove = async (
        index,
        direction
    ) => {
        if (
            reorderingId ||
            index < 0 ||
            index >= lessons.length
        ) {
            return;
        }

        const targetIndex =
            direction === "up"
                ? index - 1
                : index + 1;

        if (
            targetIndex < 0 ||
            targetIndex >= lessons.length
        ) {
            return;
        }

        const currentLesson =
            lessons[index];

        const targetLesson =
            lessons[targetIndex];

        if (
            !currentLesson?.id ||
            !targetLesson?.id
        ) {
            return;
        }

        const previousLessons = [...lessons];

        setLessons((prev) => {
            const next = [...prev];

            next[index] = targetLesson;
            next[targetIndex] = currentLesson;

            return next;
        });

        try {
            setReorderingId(
                currentLesson.id
            );

            await lessonApi.move(
                currentLesson.id,
                direction
            );
        } catch (error) {
            console.error(
                "Move lesson error:",
                error
            );

            setLessons(previousLessons);

            appToast.error(
                error?.response?.data?.message ||
                "Không thể thay đổi vị trí bài học."
            );
        } finally {
            setReorderingId(null);
        }
    };

    // ==========================================
    // Loading
    // ==========================================

    if (loading) {
        return (
            <div className="space-y-3">
                <div className="h-[76px] animate-pulse rounded-2xl bg-[var(--surface)]" />

                {[1, 2, 3].map((item) => (
                    <div
                        key={item}
                        className="h-[78px] animate-pulse rounded-2xl bg-[var(--surface)]"
                    />
                ))}
            </div>
        );
    }

    // ==========================================
    // Render
    // ==========================================

    return (
        <div className="min-h-full bg-[var(--bg)]">
            <div className="mx-auto w-full max-w-6xl">
                {/* ==================================
                    Header
                ================================== */}

                <div className="border-b border-black/[0.06] bg-[var(--surface)] px-4 py-4 sm:px-6 sm:py-5">
                    <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h2 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-[var(--ink)] sm:text-base">
                                    Nội dung
                                </h2>

                                <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[12px] font-medium tabular-nums text-[var(--muted)]">
                                    {lessons.length}
                                </span>
                            </div>

                            <p className="mt-1 text-[12px] text-[var(--muted)] sm:text-xs">
                                Quản lý và sắp xếp nội dung
                                khóa học.
                            </p>
                        </div>

                        <Link
                            to="create"
                            className={[
                                "group inline-flex shrink-0 items-center gap-1.5",
                                "rounded-xl",
                                "bg-[var(--solid)]",
                                "px-3 py-2",
                                "text-[12px] font-semibold text-white",
                                "shadow-sm",
                                "transition-all duration-200",
                                "hover:bg-[var(--solid-hover)]",
                                "hover:shadow-md",
                                "active:scale-[0.97]",
                                "sm:px-3.5 sm:py-2.5 sm:text-xs",
                            ].join(" ")}
                        >
                            <Plus
                                size={14}
                                strokeWidth={2.2}
                            />

                            <span className="sm:hidden">
                                Thêm
                            </span>

                            <span className="hidden sm:inline">
                                Thêm bài học
                            </span>
                        </Link>
                    </div>
                </div>

                {/* ==================================
                    Empty
                ================================== */}

                {lessons.length === 0 && (
                    <div className="px-2 py-3 sm:px-4">
                        <div className="rounded-2xl border border-dashed border-[var(--line-strong)] bg-[var(--surface)] px-5 py-16 text-center">
                            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--surface-2)] text-[var(--muted)]">
                                <Plus
                                    size={19}
                                    strokeWidth={1.8}
                                />
                            </div>

                            <h3 className="mt-4 text-sm font-semibold text-[var(--ink)]">
                                Chưa có bài học
                            </h3>

                            <p className="mx-auto mt-1.5 max-w-sm text-xs leading-5 text-[var(--muted)] sm:text-sm">
                                Thêm bài học đầu tiên để
                                bắt đầu xây dựng nội dung
                                cho khóa học.
                            </p>

                            <Link
                                to="create"
                                className={[
                                    "mt-5 inline-flex items-center",
                                    "rounded-xl",
                                    "bg-[var(--solid)]",
                                    "px-4 py-2.5",
                                    "text-xs font-semibold text-white",
                                    "transition-colors",
                                    "hover:bg-[var(--solid-hover)]",
                                ].join(" ")}
                            >
                                Thêm bài học
                            </Link>
                        </div>
                    </div>
                )}

                {/* ==================================
                    Lesson list
                ================================== */}

                {lessons.length > 0 && (
                    <div className="px-2 py-3 sm:px-4 sm:py-4">
                        <div className="mb-2 flex items-center justify-between px-1">
                            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                                Danh sách bài học
                            </p>

                            <p className="text-[12px] text-[var(--muted)]">
                                Dùng ↑ ↓ để sắp xếp
                            </p>
                        </div>

                        <div className="space-y-2">
                            <AnimatePresence initial={false}>
                                {lessons.map(
                                    (lesson, index) => {
                                        const hasDuration =
                                            lesson.duration !==
                                            null &&
                                            lesson.duration !==
                                            undefined;

                                        const isReordering =
                                            reorderingId ===
                                            lesson.id;

                                        return (
                                            <motion.div
                                                key={lesson.id}
                                                layout="position"
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 350,
                                                    damping: 25,
                                                    mass: 0.8,
                                                }}
                                                className={[
                                                    "group relative flex items-center gap-3",
                                                    "rounded-2xl",
                                                    "border border-black/[0.07]",
                                                    "bg-[var(--surface)]",
                                                    "px-3 py-3",
                                                    "shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
                                                    "transition-all duration-200",
                                                    "hover:border-black/[0.12]",
                                                    "hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)]",
                                                    "sm:gap-3.5 sm:px-4 sm:py-3.5",
                                                    isReordering
                                                        ? "pointer-events-none opacity-60"
                                                        : "",
                                                ].join(" ")}
                                            >
                                                {/* Lesson number */}

                                                <div
                                                    className={[
                                                        "flex h-8 w-8 shrink-0 items-center justify-center",
                                                        "rounded-xl",
                                                        "bg-[var(--surface-2)]",
                                                        "text-[12px] font-semibold tabular-nums",
                                                        "text-[var(--muted)]",
                                                        "ring-1 ring-inset ring-black/[0.04]",
                                                        "transition-all duration-200",
                                                        "group-hover:bg-[var(--solid)]",
                                                        "group-hover:text-white",
                                                        "sm:h-9 sm:w-9 sm:text-[12px]",
                                                    ].join(" ")}
                                                >
                                                    {String(
                                                        index + 1
                                                    ).padStart(
                                                        2,
                                                        "0"
                                                    )}
                                                </div>

                                                {/* Content */}

                                                <Link
                                                    to={
                                                        lesson.id
                                                    }
                                                    className="min-w-0 flex-1 py-1 focus:outline-none"
                                                >
                                                    <h3
                                                        title={
                                                            lesson.title
                                                        }
                                                        className={[
                                                            "line-clamp-2",
                                                            "text-sm font-semibold leading-5",
                                                            "tracking-[-0.01em]",
                                                            "text-[var(--ink-2)]",
                                                            "transition-colors",
                                                            "group-hover:text-[var(--ink)]",
                                                            "sm:text-[15px]",
                                                        ].join(" ")}
                                                    >
                                                        {
                                                            lesson.title
                                                        }
                                                    </h3>

                                                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                                                        {hasDuration && (
                                                            <span className="inline-flex items-center gap-1 text-[12px] font-medium tabular-nums text-[var(--muted)] sm:text-[12px]">
                                                                <Clock3
                                                                    size={
                                                                        12
                                                                    }
                                                                    strokeWidth={
                                                                        1.9
                                                                    }
                                                                />

                                                                {formatTime(
                                                                    lesson.duration
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                </Link>

                                                {/* Right actions */}

                                                <div className="flex shrink-0 items-center gap-2 sm:gap-3 sm:pl-3">
                                                    {/* Free badge */}

                                                    {lesson.isFree && (
                                                        <span className="rounded-full bg-[var(--success-soft)] px-2 py-1 text-[12px] font-semibold whitespace-nowrap text-[var(--success)] sm:text-[12px]">
                                                            Miễn phí
                                                        </span>
                                                    )}

                                                    {/* Reorder */}

                                                    <div className="-my-3 flex flex-col items-center justify-center border-l border-[var(--surface-2)] sm:-my-3.5">
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                index ===
                                                                0 ||
                                                                Boolean(
                                                                    reorderingId
                                                                )
                                                            }
                                                            onClick={() =>
                                                                handleMove(
                                                                    index,
                                                                    "up"
                                                                )
                                                            }
                                                            title="Đưa bài học lên"
                                                            aria-label="Đưa bài học lên"
                                                            className={[
                                                                "flex h-11 w-11 items-center justify-center rounded-full",
                                                                "text-[var(--muted)]",
                                                                "transition-colors",
                                                                "hover:bg-[var(--surface-2)]",
                                                                "hover:text-[var(--ink)]",
                                                                "active:scale-90",
                                                                "disabled:cursor-not-allowed",
                                                                "disabled:opacity-20",
                                                            ].join(" ")}
                                                        >
                                                            <ChevronUp
                                                                size={
                                                                    16
                                                                }
                                                                strokeWidth={
                                                                    2.4
                                                                }
                                                            />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                index ===
                                                                lessons.length -
                                                                1 ||
                                                                Boolean(
                                                                    reorderingId
                                                                )
                                                            }
                                                            onClick={() =>
                                                                handleMove(
                                                                    index,
                                                                    "down"
                                                                )
                                                            }
                                                            title="Đưa bài học xuống"
                                                            aria-label="Đưa bài học xuống"
                                                            className={[
                                                                "flex h-11 w-11 items-center justify-center rounded-full",
                                                                "text-[var(--muted)]",
                                                                "transition-colors",
                                                                "hover:bg-[var(--surface-2)]",
                                                                "hover:text-[var(--ink)]",
                                                                "active:scale-90",
                                                                "disabled:cursor-not-allowed",
                                                                "disabled:opacity-20",
                                                            ].join(" ")}
                                                        >
                                                            <ChevronDown
                                                                size={
                                                                    16
                                                                }
                                                                strokeWidth={
                                                                    2.4
                                                                }
                                                            />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Reordering overlay */}

                                                {isReordering && (
                                                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-[var(--surface)]/70 backdrop-blur-[1px]">
                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--ink)] border-t-transparent" />
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    }
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseLessonsPage;
