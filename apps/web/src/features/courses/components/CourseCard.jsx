import { ArrowRight, BookOpen, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

import getUrl from "@/lib/getUrl.js";
import formatPrice from "@/lib/format/formatPrice.js";

const CourseCard = ({ course }) => {
    const navigate = useNavigate();

    const thumbnail = course.thumbnail
        ? getUrl(course.thumbnail)
        : `https://picsum.photos/seed/${course.id}/600/340`;

    // ==========================================
    // Status
    // ==========================================
    const isOpen = course.status === true;

    const status = {
        label: isOpen ? "Mở" : "Khoá",
        className: isOpen
            ? "border border-emerald-300/40 bg-[var(--success)]/10 text-[var(--success)]"
            : "border border-amber-300/40 bg-amber-500/10 text-amber-700",
        dotClassName: isOpen
            ? "bg-[var(--success)]"
            : "bg-amber-500",
    };

    // ==========================================
    // Stats
    // ==========================================
    const lessonCount = course.lessonCount ?? 0;
    const studentCount = course.enrollmentCount ?? 0;

    // ==========================================
    // Price
    // ==========================================
    const priceLabel =
        Number(course.price) === 0
            ? "Miễn phí"
            : `${(formatPrice(course.price)).toLocaleString("vi-VN")}`;

    // ==========================================
    // Duration
    // ==========================================
    const durationLabel =
        Number(course.durationMonths) === 0
            ? "Không giới hạn"
            : `${course.durationMonths} tháng`;

    // ==========================================
    // Updated date
    // ==========================================
    const updatedDate = course.updatedAt
        ? new Date(course.updatedAt).toLocaleDateString(
            "vi-VN",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            }
        )
        : null;

    // ==========================================
    // Navigate
    // ==========================================
    const handleCardClick = () => {
        navigate(`/teacher/courses/${course.id}`);
    };

    return (
        <article
            onClick={handleCardClick}
            className="
                group
                relative
                cursor-pointer
                overflow-hidden
                rounded-lg
                border
                border-[var(--line)]/80
                bg-[var(--surface)]
                shadow-[0_4px_20px_-4px_rgba(36,77,168,0.06)]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-[var(--brand)]/30
                hover:shadow-[0_12px_28px_-6px_rgba(36,77,168,0.15)]
            "
        >
            {/* Decoration */}
            <div
                className="
                    pointer-events-none
                    absolute
                    -right-10
                    -top-10
                    h-32
                    w-32
                    rounded-full
                    bg-[var(--brand-solid)]/5
                    blur-2xl
                    transition-all
                    duration-500
                    group-hover:scale-150
                    group-hover:bg-[var(--brand-solid)]/10
                "
            />

            {/* Thumbnail */}
            <div
                className="
                    relative
                    aspect-video
                    w-full
                    overflow-hidden
                    bg-[var(--surface-2)]
                "
            >
                <img
                    src={thumbnail}
                    alt={course.title}
                    className="
                        h-full
                        w-full
                        object-cover
                        transition
                        duration-500
                        group-hover:scale-105
                    "
                />

                <div
                    className="
                        absolute
                        inset-0
                        bg-gradient-to-t
                        from-slate-900/20
                        via-transparent
                        to-transparent
                        opacity-0
                        transition-opacity
                        duration-300
                        group-hover:opacity-100
                    "
                />
            </div>

            {/* Content */}
            <div
                className="
                    relative
                    z-10
                    flex
                    min-w-0
                    flex-col
                    p-3.5
                    sm:p-4
                "
            >
                {/* Title + Manage */}
                <div className="flex items-center gap-2">
                    <h2
                        title={course.title}
                        className="
                            line-clamp-2
                            min-w-0
                            flex-1
                            text-sm
                            font-bold
                            leading-5
                            text-[var(--brand-strong)]
                            transition-colors
                            duration-200
                            group-hover:text-[var(--brand)]
                            sm:text-base
                        "
                    >
                        {course.title}
                    </h2>

                    <button
                        type="button"
                        aria-label="Quản lý khóa học"
                        className="
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-[var(--line)]
                            bg-[var(--surface)]/80
                            text-[var(--faint)]
                            shadow-sm
                            transition-all
                            duration-300
                            group-hover:border-[var(--brand)]
                            group-hover:bg-[var(--brand-solid)]
                            group-hover:text-white
                            group-hover:shadow-md
                            group-hover:shadow-[var(--brand)]/20
                        "
                    >
                        <ArrowRight
                            size={17}
                            className="
                                transition-transform
                                duration-300
                                group-hover:translate-x-0.5
                            "
                        />
                    </button>
                </div>

                {/* Description */}
                <p
                    className="
                        mt-1.5
                        line-clamp-2
                        text-xs
                        leading-5
                        text-[var(--muted)]
                        sm:text-sm
                    "
                >
                    {course.description ||
                        "Chưa có mô tả cho khóa học này."}
                </p>

                {/* Stats */}
                <div
                    className="
                        mt-3.5
                        flex
                        items-center
                        justify-between
                    "
                >
                    <div className="
                        flex
                        items-center
                        gap-3
                        text-xs
                        text-[var(--muted)]
                    ">
                        <span
                            className="
                            inline-flex
                            items-center
                            gap-1.5
                            font-medium
                            text-[var(--muted)]
                        "
                        >
                            <BookOpen
                                size={14}
                                className="text-[var(--brand)]"
                            />
                            {lessonCount} bài học
                        </span>

                        <span className="h-3.5 w-px bg-[var(--line)]/80" />

                        <span
                            className="
                            inline-flex
                            items-center
                            gap-1.5
                            font-medium
                            text-[var(--muted)]
                        "
                        >
                            <Users
                                size={14}
                                className="text-[var(--brand)]/80"
                            />
                            {studentCount} học viên
                        </span>
                    </div>
                    {/* Updated date */}
                    {updatedDate && (
                        <span
                            className="
                                text-[10px]
                                text-[var(--faint)]
                            "
                        >
                            Cập nhật {updatedDate}
                        </span>
                    )}
                </div>

                {/* Footer */}
                <div
                    className="
                        mt-3.5
                        flex
                        items-center
                        justify-between
                        gap-3
                        border-t
                        border-[var(--line)]/80
                        pt-3
                    "
                >
                    {/* Price + Duration */}
                    <div
                        className="
                            flex
                            min-w-0
                            items-baseline
                            gap-1.5
                        "
                    >
                        <span
                            className="
                                truncate
                                text-xs
                                font-bold
                                text-[var(--brand)]
                            "
                        >
                            {priceLabel}
                        </span>

                        <span
                            className="
                                shrink-0
                                text-[11px]
                                text-[var(--faint)]
                            "
                        >
                            /
                        </span>

                        <span
                            className="
                                truncate
                                text-xs
                                text-[var(--muted)]
                            "
                        >
                            {durationLabel}
                        </span>
                    </div>

                    {/* Status */}
                    <span
                        className={`
                            inline-flex
                            shrink-0
                            items-center
                            gap-1.5
                            rounded-full
                            px-2.5
                            py-1
                            text-[11px]
                            font-semibold
                            backdrop-blur-sm
                            ${status.className}
                        `}
                    >
                        <span
                            className={`
                                h-1.5
                                w-1.5
                                rounded-full
                                ${status.dotClassName}
                            `}
                        />

                        {status.label}
                    </span>
                </div>


            </div>
        </article>
    );
};

export default CourseCard;