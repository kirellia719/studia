import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
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

    return (
        <div className="min-h-full bg-[var(--surface-3)]">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* PAGE HEADER */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-[var(--ink)] sm:text-2xl">
                            Khóa học
                        </h1>

                        <p className="mt-1 text-sm text-[var(--muted)]">
                            Quản lý các khóa học của bạn.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleCreateCourse}
                        className={[
                            "inline-flex shrink-0 items-center justify-center gap-2",
                            "rounded-lg px-4 py-2.5",
                            "bg-[var(--solid)] text-sm font-medium text-white",
                            "transition-colors duration-150",
                            "hover:bg-[var(--solid-hover)]",
                            "active:bg-[var(--solid)]",
                        ].join(" ")}
                    >
                        <Plus size={18} strokeWidth={2} />

                        <span className="hidden sm:inline">
                            Tạo khóa học
                        </span>

                        <span className="sm:hidden">
                            Tạo
                        </span>
                    </button>
                </div>

                {/* CONTENT */}
                {loading && (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <CourseCardSkeleton key={index} />
                        ))}
                    </div>
                )}

                {/* ERROR */}
                {!loading && error && (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface)] px-6 py-16 text-center">
                        <p className="text-sm font-medium text-[var(--muted)]">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={fetchCourses}
                            className={[
                                "mt-4 rounded-lg",
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
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
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