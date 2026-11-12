import { ArrowLeft, BookOpen } from "lucide-react";
import { useMatch, useNavigate } from "react-router-dom";

import Breadcrumb from "@/components/ui/Breadcrumb.jsx";
import CourseDetailTabs from "@/features/courses/teacher/detail/components/CourseDetailTabs.jsx";

const CourseNavigation = ({ course }) => {
    const navigate = useNavigate();
    const isLessonEditor = useMatch(
        "/teacher/courses/:courseId/lessons/:lessonId"
    );

    // Trang sửa bài học chỉ giữ header của bài, không còn breadcrumb
    // hay tab của khoá học.
    if (isLessonEditor) {
        return null;
    }

    return (
        <div
            className={[
                "z-30",
                "bg-[var(--surface)]",
                // Mobile
                "sticky top-0",
                // Desktop
                "lg:static",
            ].join(" ")}
        >
            {/* =====================================================
                DESKTOP
            ====================================================== */}
            <div className="hidden border-b border-[var(--line)] px-5 py-3 lg:block">
                <Breadcrumb
                    currentAs="h1"
                    items={[
                        {
                            label: "Khóa học",
                            to: "/teacher/courses",
                            icon: BookOpen,
                        },
                        {
                            label: course.title,
                        },
                    ]}
                />
            </div>

            {/* =====================================================
                MOBILE COURSE HEADER
            ====================================================== */}
            <div
                className={[
                    "h-12 items-center",
                    "border-b border-[var(--line)]",
                    "px-3",
                    "flex lg:hidden",
                ].join(" ")}
            >
                <button
                    type="button"
                    onClick={() => navigate("/teacher/courses")}
                    aria-label="Quay lại danh sách khóa học"
                    className={[
                        "flex h-11 w-11 shrink-0 items-center justify-center",
                        "rounded-full",
                        "text-[var(--muted)]",
                        "transition-colors",
                        "active:bg-[var(--surface-2)]",
                    ].join(" ")}
                >
                    <ArrowLeft
                        size={20}
                        strokeWidth={2}
                    />
                </button>

                <h1
                    className={[
                        "min-w-0 flex-1",
                        "truncate",
                        "px-2",
                        "text-[14px] font-semibold",
                        "text-[var(--ink)]",
                    ].join(" ")}
                >
                    {course.title}
                </h1>
            </div>

            {/* =====================================================
                COURSE TABS
            ====================================================== */}
            <div>
                <CourseDetailTabs courseId={course.id} />
            </div>
        </div>
    );
};

export default CourseNavigation;
