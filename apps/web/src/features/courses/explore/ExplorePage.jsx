import { useEffect, useMemo, useState } from "react";

import {
    AlertCircle,
    BookOpen,
    CalendarDays,
    Clock3,
    Compass,
    Search,
    X,
} from "lucide-react";

import { Link } from "react-router-dom";

import Loading from "@/components/ui/Loading.jsx";

import courseApi from "@/features/courses/api.js";

import formatDuration from "@/lib/format/formatDuration.js";
import formatPrice from "@/lib/format/formatPrice.js";
import getUrl from "@/lib/getUrl.js";

const FILTERS = [
    { id: "ALL", label: "Tất cả" },
    { id: "FREE", label: "Miễn phí" },
];

const ExplorePage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [filter, setFilter] = useState("ALL");

    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query.trim());
        }, 350);

        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        let active = true;

        const fetchCourses = async () => {
            try {
                setLoading(true);
                setError(false);

                const response =
                    await courseApi.searchPublishedCourses({
                        search: debouncedQuery,
                    });

                if (!active) return;

                setCourses(response?.data || []);
            } catch (fetchError) {
                if (!active) return;

                console.error(
                    "Failed to fetch courses:",
                    fetchError
                );

                setCourses([]);
                setError(true);
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchCourses();

        return () => {
            active = false;
        };
    }, [debouncedQuery, reloadKey]);

    const filteredCourses = useMemo(() => {
        if (filter === "FREE") {
            return courses.filter(
                (course) => Number(course.price || 0) <= 0
            );
        }

        return courses;
    }, [courses, filter]);

    const hasFilter =
        Boolean(debouncedQuery) || filter !== "ALL";

    const clearFilters = () => {
        setQuery("");
        setFilter("ALL");
    };

    return (
        <div className="min-h-full bg-[var(--bg)]">
            {/* HEADER */}
            <header className="page-band sticky top-0 z-30 h-16">
                <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
                    <div className="flex min-w-0 items-center gap-2.5">
                        <span className="brand-tile flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                            <Compass size={19} strokeWidth={2} />
                        </span>

                        <h1 className="truncate text-lg font-semibold tracking-tight text-[var(--ink)]">
                            Khám phá
                        </h1>
                    </div>

                    {!loading && !error && (
                        <span
                            className={[
                                "flex h-7 min-w-7 items-center justify-center",
                                "rounded-full bg-[var(--brand-solid)] px-2.5",
                                "text-xs font-semibold text-white",
                                "shadow-sm",
                            ].join(" ")}
                        >
                            {filteredCourses.length}
                        </span>
                    )}
                </div>
            </header>

            {/* BODY */}
            <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 sm:py-6 lg:px-8">
                {/* SEARCH + FILTER */}
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search
                            size={17}
                            strokeWidth={1.9}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--faint)]"
                        />

                        <input
                            type="search"
                            value={query}
                            onChange={(event) =>
                                setQuery(event.target.value)
                            }
                            placeholder="Tìm khóa học..."
                            aria-label="Tìm kiếm khóa học"
                            className={[
                                "h-11 w-full rounded-full border border-[var(--line)]",
                                "bg-[var(--surface)] pl-11 pr-11",
                                "text-base text-[var(--ink)] sm:text-sm",
                                "outline-none transition",
                                "placeholder:text-[var(--faint)]",
                                "hover:border-[var(--line-strong)]",
                                "focus:border-[var(--brand)]",
                                "focus:ring-2 focus:ring-[var(--brand)]/15",
                                "[&::-webkit-search-cancel-button]:appearance-none",
                            ].join(" ")}
                        />

                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery("")}
                                aria-label="Xóa từ khóa"
                                className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[var(--faint)] transition hover:bg-[var(--surface-2)] hover:text-[var(--ink-2)]"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <div
                        role="group"
                        aria-label="Lọc khóa học"
                        className="flex gap-2"
                    >
                        {FILTERS.map((item) => {
                            const isActive = filter === item.id;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setFilter(item.id)}
                                    aria-pressed={isActive}
                                    className={[
                                        "h-11 flex-1 rounded-full border px-4",
                                        "text-[13px] font-medium",
                                        "transition-colors duration-150",
                                        "sm:flex-none",
                                        isActive
                                            ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-text)]"
                                            : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--surface-3)]",
                                    ].join(" ")}
                                >
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* LOADING */}
                {loading && courses.length === 0 && (
                    <div
                        className={[
                            "flex min-h-[280px]",
                            "items-center justify-center",
                            "rounded-2xl",
                            "border border-[var(--line)]",
                            "bg-[var(--surface)]",
                        ].join(" ")}
                    >
                        <Loading
                            text="Đang tải khóa học..."
                            fullScreen={false}
                        />
                    </div>
                )}

                {loading && courses.length > 0 && (
                    <p className="mb-3 text-[13px] text-[var(--muted)]">
                        Đang cập nhật kết quả...
                    </p>
                )}

                {/* ERROR */}
                {!loading && error && (
                    <div
                        className={[
                            "mx-auto flex min-h-[280px] max-w-xl",
                            "flex-col items-center justify-center",
                            "rounded-2xl",
                            "border border-[var(--line)]",
                            "bg-[var(--surface)]",
                            "px-6 text-center",
                        ].join(" ")}
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-2)]">
                            <AlertCircle
                                size={22}
                                strokeWidth={1.6}
                                className="text-[var(--danger)]"
                            />
                        </div>

                        <h2 className="mt-4 text-sm font-semibold text-[var(--ink)]">
                            Không tải được khóa học
                        </h2>

                        <p className="mt-1 text-[13px] leading-5 text-[var(--muted)]">
                            Kiểm tra kết nối mạng rồi thử lại.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                setReloadKey((value) => value + 1)
                            }
                            className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand-solid)] px-5 text-sm font-medium text-white transition hover:bg-[var(--brand-solid-hover)]"
                        >
                            Thử lại
                        </button>
                    </div>
                )}

                {/* COURSES */}
                {!error && filteredCourses.length > 0 && (
                    <div
                        className={[
                            "grid grid-cols-1 gap-5",
                            "sm:grid-cols-2",
                            "lg:grid-cols-3",
                            "xl:grid-cols-4",
                        ].join(" ")}
                    >
                        {filteredCourses.map((course) => {
                            const isFree =
                                Number(course.price || 0) <= 0;

                            const durationMonths =
                                Number(course.durationMonths || 0);

                            return (
                                <Link
                                    key={course.id}
                                    to={`/student/explore/${course.id}`}
                                    className={[
                                        "group flex h-full flex-col",
                                        "overflow-hidden rounded-2xl",
                                        "border border-[var(--line)]",
                                        "bg-[var(--surface)]",
                                        "text-left",
                                        "transition-all duration-200",
                                        "hover:-translate-y-1",
                                        "hover:border-[var(--brand)]",
                                        "hover:shadow-[0_14px_34px_-12px_var(--ring)]",
                                        "focus-visible:outline-none",
                                        "focus-visible:ring-2 focus-visible:ring-[var(--brand)]/30",
                                    ].join(" ")}
                                >
                                    {/* THUMBNAIL */}
                                    <div className="relative aspect-[16/9] overflow-hidden bg-[var(--bg)]">
                                        {course.thumbnail ? (
                                            <img
                                                src={getUrl(
                                                    course.thumbnail
                                                )}
                                                alt={course.title}
                                                loading="lazy"
                                                decoding="async"
                                                className={[
                                                    "h-full w-full object-cover",
                                                    "transition-transform duration-300",
                                                    "group-hover:scale-[1.03]",
                                                ].join(" ")}
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-[var(--faint)]">
                                                <BookOpen
                                                    size={32}
                                                    strokeWidth={1.5}
                                                />
                                            </div>
                                        )}

                                        {/* DARK OVERLAY */}
                                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

                                        {/* PRICE */}
                                        <div className="absolute bottom-3 right-3">
                                            <span
                                                className={[
                                                    "inline-flex items-center",
                                                    "rounded-full",
                                                    "px-3 py-1.5",
                                                    "text-[12px] font-semibold",
                                                    "shadow-[0_2px_8px_rgba(0,0,0,0.15)]",
                                                    "backdrop-blur-sm",
                                                    isFree
                                                        ? "bg-[var(--surface)]/95 text-[var(--success)]"
                                                        : "bg-[var(--solid)]/95 text-white",
                                                ].join(" ")}
                                            >
                                                {isFree
                                                    ? "Miễn phí"
                                                    : formatPrice(
                                                        course.price
                                                    )}
                                            </span>
                                        </div>
                                    </div>

                                    {/* CONTENT */}
                                    <div className="flex flex-1 flex-col p-4">
                                        {/* TITLE */}
                                        <h2 className="line-clamp-2 text-[15px] font-semibold leading-[21px] text-[var(--ink)]">
                                            {course.title}
                                        </h2>

                                        {/* TEACHER */}
                                        <p className="mt-2 truncate text-[13px] text-[var(--muted)]">
                                            {course.teacher?.name ||
                                                "Giáo viên Achan"}
                                        </p>

                                        {/* META */}
                                        <div className="mt-4 border-t border-[var(--surface-2)] pt-3.5">
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] text-[var(--muted)]">
                                                {/* LESSON COUNT */}
                                                <span className="flex items-center gap-1.5">
                                                    <BookOpen
                                                        size={14}
                                                        strokeWidth={1.8}
                                                    />

                                                    <span>
                                                        {course.lessonCount ??
                                                            0}{" "}
                                                        bài
                                                    </span>
                                                </span>

                                                {/* DIVIDER */}
                                                <span className="h-3.5 w-px bg-[var(--line)]" />

                                                {/* DURATION */}
                                                <span className="flex items-center gap-1.5">
                                                    <Clock3
                                                        size={14}
                                                        strokeWidth={1.8}
                                                    />

                                                    <span>
                                                        {formatDuration(
                                                            course.totalDuration ??
                                                            0
                                                        )}
                                                    </span>
                                                </span>

                                                {/* MONTHS */}
                                                {durationMonths > 0 && (
                                                    <>
                                                        <span className="h-3.5 w-px bg-[var(--line)]" />

                                                        <span className="flex items-center gap-1.5">
                                                            <CalendarDays
                                                                size={14}
                                                                strokeWidth={
                                                                    1.8
                                                                }
                                                            />

                                                            <span>
                                                                {
                                                                    durationMonths
                                                                }{" "}
                                                                tháng
                                                            </span>
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* VIEW BUTTON */}
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="text-[12px] text-[var(--faint)]">
                                                Xem chi tiết
                                            </span>

                                            <span
                                                className={[
                                                    "inline-flex items-center",
                                                    "rounded-full",
                                                    "bg-[var(--brand-solid)]",
                                                    "px-3.5 py-1.5",
                                                    "text-[12px] font-semibold",
                                                    "text-white",
                                                    "shadow-sm",
                                                    "transition-all duration-200",
                                                    "group-hover:bg-[var(--brand-solid-hover)]",
                                                    "group-hover:shadow-md",
                                                ].join(" ")}
                                            >
                                                Xem
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* EMPTY */}
                {!loading && !error && filteredCourses.length === 0 && (
                    <div
                        className={[
                            "mx-auto flex min-h-[280px] max-w-xl",
                            "flex-col items-center justify-center",
                            "rounded-2xl",
                            "border border-[var(--line)]",
                            "bg-[var(--surface)]",
                            "px-6",
                            "text-center",
                        ].join(" ")}
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-2)]">
                            <BookOpen
                                size={22}
                                strokeWidth={1.5}
                                className="text-[var(--faint)]"
                            />
                        </div>

                        <h2 className="mt-4 text-sm font-semibold text-[var(--ink)]">
                            {hasFilter
                                ? "Không tìm thấy khóa học phù hợp"
                                : "Chưa có khóa học"}
                        </h2>

                        <p className="mt-1 text-[13px] leading-5 text-[var(--muted)]">
                            {hasFilter
                                ? "Thử từ khóa khác hoặc bỏ bộ lọc để xem tất cả khóa học."
                                : "Hiện tại chưa có khóa học nào để hiển thị."}
                        </p>

                        {hasFilter && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="mt-4 inline-flex h-11 items-center justify-center rounded-full border border-[var(--line)] px-5 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--surface-3)]"
                            >
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExplorePage;
