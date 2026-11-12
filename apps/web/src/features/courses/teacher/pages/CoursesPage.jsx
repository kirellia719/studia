import { useEffect, useState } from "react";
import { BookOpen, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import courseApi from "@/features/courses/api.js";

import CourseCard from "@/features/courses/components/CourseCard.jsx";
import CourseCardSkeleton from "@/features/courses/components/CourseCardSkeleton.jsx";
import EmptyCourses from "@/features/courses/components/EmptyCourses.jsx";

const CoursesPage = () => {
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchCourses = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await courseApi.getMyCourses();

            setCourses(response.data || []);
        } catch (error) {
            console.error(error);

            setError(
                error?.response?.data?.message ||
                    "Không thể tải danh sách khóa học."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleCreateCourse = () => {
        navigate("/teacher/courses/create");
    };

    const summary = loading
        ? "Đang tải…"
        : error
            ? "Không tải được danh sách"
            : courses.length > 0
                ? `${courses.length} khóa học`
                : "Quản lý các khóa học của bạn";

    return (
        <div className="min-h-dvh bg-[var(--surface-3)]">
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                {/* PAGE HEADER */}
                <div className="page-band mb-4 flex items-center gap-3 rounded-xl border border-[var(--line)] p-3 sm:mb-5 sm:rounded-2xl sm:p-4">
                    <span className="brand-tile flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                        <BookOpen size={19} strokeWidth={2} />
                    </span>

                    <div className="min-w-0 flex-1">
                        <h1 className="text-lg font-semibold tracking-tight text-[var(--ink)] sm:text-2xl">
                            Khóa học
                        </h1>

                        <p className="mt-0.5 truncate text-[13px] text-[var(--muted)] sm:text-sm">
                            {summary}
                        </p>
                    </div>

                    {!loading && !error && courses.length > 0 && (
                        <button
                            type="button"
                            onClick={handleCreateCourse}
                            className={[
                                "inline-flex h-11 shrink-0 items-center justify-center gap-1.5",
                                "rounded-full px-3 sm:px-4",
                                "bg-[var(--brand-solid)] text-sm font-semibold text-white",
                                "shadow-sm shadow-[var(--ring)]",
                                "transition-colors duration-150",
                                "hover:bg-[var(--brand-solid-hover)]",
                                "active:bg-[var(--brand-strong)]",
                            ].join(" ")}
                        >
                            <Plus size={17} strokeWidth={2.2} />

                            <span className="sm:hidden">Tạo</span>
                            <span className="hidden sm:inline">Tạo khóa học</span>
                        </button>
                    )}
                </div>

                {/* CONTENT */}
                {loading && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <CourseCardSkeleton key={index} />
                        ))}
                    </div>
                )}

                {/* ERROR */}
                {!loading && error && (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-6 py-16 text-center">
                        <p className="text-sm font-medium text-[var(--muted)]">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={fetchCourses}
                            className={[
                                "mt-4 rounded-full",
                                "border border-[var(--line)]",
                                "bg-[var(--surface)] px-4 py-2",
                                "text-sm font-medium text-[var(--ink)]",
                                "transition-colors duration-150",
                                "hover:bg-[var(--surface-3)]",
                            ].join(" ")}
                        >
                            Thử lại
                        </button>
                    </div>
                )}

                {/* EMPTY */}
                {!loading && !error && courses.length === 0 && (
                    <EmptyCourses onCreate={handleCreateCourse} />
                )}

                {/* COURSES */}
                {!loading && !error && courses.length > 0 && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
                        {courses.map((course) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoursesPage;
