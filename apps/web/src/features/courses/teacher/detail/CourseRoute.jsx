import { Route, Routes } from "react-router-dom"
import CourseDetailPage from "@/features/courses/teacher/detail/CourseDetailPage.jsx";

import LessonLayout from "@/features/lessons/pages/LessonLayout.jsx"
import CourseOverviewPage from "@/features/courses/teacher/detail/overview/CourseOverviewPage.jsx"
import CourseLessonsPage from "@/features/lessons/pages/CourseLessonsPage.jsx";
import CourseEnrollmentsPage from "@/features/enrollments/pages/CourseEnrollmentsPage.jsx";

const CourseRoute = () => {
    return (
        <Routes>
            {/* /teach/courses/:courseId */}
            <Route path="*" element={<CourseDetailPage />}>
                <Route
                    index
                    element={<CourseOverviewPage />}
                />

                {/* /teach/courses/:courseId/lessons */}
                <Route
                    path="lessons"
                    element={<CourseLessonsPage />}
                />

                {/* /teach/courses/:courseId/students */}
                <Route
                    path="students"
                    element={<CourseEnrollmentsPage />}
                />
            </Route>
            <Route path="/lessons/*" element={<LessonLayout />} />
        </Routes>
    )
}

export default CourseRoute;