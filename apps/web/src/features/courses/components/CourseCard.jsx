import { BookOpen, Users } from "lucide-react";
import { Link } from "react-router-dom";

import getUrl from "@/lib/getUrl.js";
import formatPrice from "@/lib/format/formatPrice.js";

const formatUpdatedAt = (value) => {
    if (!value) return null;

    return new Date(value).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

const CourseCard = ({ course }) => {
    const isOpen = course.status === true;

    const thumbnail = course.thumbnail ? getUrl(course.thumbnail) : null;

    // ==========================================
    // Stats
    // ==========================================
    const lessonCount = course.lessonCount ?? 0;
    const studentCount = course.enrollmentCount ?? 0;

    // ==========================================
    // Duration
    // ==========================================
    const durationMonths = Number(course.durationMonths);
    const durationLabel =
        !durationMonths || durationMonths <= 0
            ? "Không giới hạn"
            : `${durationMonths} tháng`;

    const updatedAt = formatUpdatedAt(course.updatedAt);

    return (
        <Link
            to={`/teacher/courses/${course.id}`}
            className="
                group
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-[var(--line)]
                bg-[var(--surface)]
                p-3
                shadow-[0_2px_12px_rgba(15,23,42,0.04)]
                transition-colors
                duration-200
                hover:border-[var(--brand)]
                sm:flex-col
                sm:items-stretch
                sm:gap-0
                sm:overflow-hidden
                sm:p-0
            "
        >
            {/* Thumbnail */}
            <div
                className="
                    relative
                    h-16
                    w-24
                    shrink-0
                    overflow-hidden
                    rounded-lg
                    bg-[var(--surface-2)]
                    sm:aspect-[2/1]
                    sm:h-auto
                    sm:w-full
                    sm:rounded-none
                "
            >
                {thumbnail ? (
                    <img
                        src={thumbnail}
                        alt=""
                        width="640"
                        height="360"
                        loading="lazy"
                        className="
                            h-full
                            w-full
                            object-cover
                            transition-transform
                            duration-300
                            group-hover:scale-[1.03]
                        "
                    />
                ) : (
                    <span
                        className="
                            relative
                            flex
                            h-full
                            w-full
                            items-center
                            justify-center
                            bg-[var(--brand-soft)]
                            text-[var(--brand-text)]
                        "
                    >
                        <span
                            aria-hidden="true"
                            className="deco-dots pointer-events-none absolute inset-0 opacity-30"
                        />

                        <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface)] text-[var(--brand-text)] shadow-sm sm:h-16 sm:w-16 sm:rounded-2xl">
                            <BookOpen
                                strokeWidth={1.7}
                                className="h-5 w-5 sm:h-7 sm:w-7"
                            />
                        </span>
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1 sm:p-4">
                {/* Title */}
                <h2
                    title={course.title}
                    className="
                        line-clamp-2
                        text-[15px]
                        font-semibold
                        leading-5
                        tracking-tight
                        text-[var(--ink)]
                        transition-colors
                        duration-200
                        group-hover:text-[var(--brand-text)]
                    "
                >
                    {course.title}
                </h2>

                {/* Stats + Updated */}
                <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--muted)]">
                        <span className="inline-flex items-center gap-1">
                            <BookOpen
                                size={13}
                                className="shrink-0 text-[var(--brand-text)]/70"
                            />

                            {lessonCount} bài học
                        </span>

                        <span
                            aria-hidden="true"
                            className="text-[var(--line-strong)]"
                        >
                            •
                        </span>

                        <span className="inline-flex items-center gap-1">
                            <Users
                                size={13}
                                className="shrink-0 text-[var(--brand-text)]/70"
                            />

                            {studentCount} học viên
                        </span>
                    </p>

                    {updatedAt && (
                        <span className="hidden shrink-0 whitespace-nowrap text-xs text-[var(--faint)] sm:inline">
                            Cập nhật {updatedAt}
                        </span>
                    )}
                </div>

                {/* Price + Status */}
                <div
                    className="
                        mt-1.5
                        flex
                        flex-wrap
                        items-center
                        justify-between
                        gap-x-2
                        gap-y-1
                        sm:mt-3
                        sm:border-t
                        sm:border-[var(--line)]/70
                        sm:pt-3
                    "
                >
                    <p className="text-[13px] font-semibold text-[var(--brand-text)]">
                        {formatPrice(course.price)}

                        <span className="ml-1 text-xs font-normal text-[var(--muted)]">
                            · {durationLabel}
                        </span>
                    </p>

                    <span
                        className={[
                            "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5",
                            "text-[12px] font-semibold",
                            isOpen
                                ? "border-[var(--success)]/30 bg-[var(--success-soft)] text-[var(--success)]"
                                : "border-[var(--accent)]/30 bg-[var(--accent-soft)] text-[var(--accent)]",
                        ].join(" ")}
                    >
                        <span
                            className={[
                                "h-1.5 w-1.5 rounded-full",
                                isOpen
                                    ? "bg-[var(--success)]"
                                    : "bg-[var(--accent-solid)]",
                            ].join(" ")}
                        />

                        {isOpen ? "Đang mở" : "Tạm khoá"}
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default CourseCard;
