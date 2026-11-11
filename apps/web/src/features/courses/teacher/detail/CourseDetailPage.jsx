import { useEffect, useState } from "react";
import { Outlet, useParams } from "react-router-dom";

import courseApi from "@/features/courses/api.js";
import CourseNavigation from "@/features/courses/teacher/detail/components/CourseNavigation.jsx";

const CourseDetailPage = () => {
    const { courseId } = useParams();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                setLoading(true);
                setError("");

                const response =
                    await courseApi.getCourseDetails(courseId);

                setCourse(response.data);
            } catch (error) {
                console.error(error);

                setError(
                    error?.response?.data?.message ||
                    "Không thể tải thông tin khóa học."
                );
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchCourse();
        }
    }, [courseId]);

    if (loading) {
        return (
            <div className="min-h-full bg-[var(--bg)]">
                <div className="space-y-4 p-4 lg:p-5">
                    {/* Navigation skeleton */}
                    <div className="h-5 w-64 animate-pulse rounded bg-[var(--line)]" />

                    {/* Tabs skeleton */}
                    <div className="h-10 animate-pulse rounded bg-[var(--line)]" />

                    {/* Content skeleton */}
                    <div className="h-64 animate-pulse rounded bg-[var(--line)]" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-full bg-[var(--bg)] p-4 lg:p-5">
                <div
                    className={[
                        "rounded-lg",
                        "border border-red-100",
                        "bg-[var(--danger-soft)]",
                        "px-4 py-5",
                        "text-sm text-[var(--danger)]",
                    ].join(" ")}
                >
                    {error}
                </div>
            </div>
        );
    }

    if (!course) {
        return null;
    }

    return (
        <div className="min-h-full bg-[var(--bg)] relative">
            <CourseNavigation
                course={course}
            />

            <Outlet
                context={{
                    course,
                    setCourse,
                }}
            />
        </div>
    );
};

export default CourseDetailPage;