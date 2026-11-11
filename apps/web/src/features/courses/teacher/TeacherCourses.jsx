import { Route, Routes } from "react-router-dom";

import CoursesPage from "@/features/courses/teacher/pages/CoursesPage.jsx";
import CourseCreatePage from "@/features/courses/teacher/pages/CourseCreatePage.jsx";
import CourseRoute from "@/features/courses/teacher/detail/CourseRoute.jsx";

const TeacherCourses = () => {
    return (
        <Routes>
            <Route
                index
                element={<CoursesPage />}
            />

            <Route
                path="create"
                element={<CourseCreatePage />}
            />

            <Route
                path=":courseId/*"
                element={<CourseRoute />}
            />
        </Routes>
    );
};

export default TeacherCourses;