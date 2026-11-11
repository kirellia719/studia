import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "@/app/routes/ProtectedRoute.jsx";
import GuestRoute from "@/app/routes/GuestRoute.jsx";
import RoleRoute from "@/app/routes/RoleRoute.jsx";

import StudentLayout from "@/components/layout/student/StudentLayout.jsx";
import TeacherLayout from "@/components/layout/teacher/TeacherLayout.jsx";

import LoginPage from "@/features/auth/pages/LoginPage.jsx";
import RegisterPage from "@/features/auth/pages/RegisterPage.jsx";
import LandingPage from "@/features/landing/LandingPage.jsx";

import StudentCoursesPage from "@/features/courses/student/StudentCoursesPage.jsx";
import StudentCourseDetailPage from "@/features/courses/student/StudentCourseDetailPage.jsx";
import ExplorePage from "@/features/courses/explore/ExplorePage.jsx";
import ExploreCourseDetailPage from "@/features/courses/explore/ExploreCourseDetailPage.jsx";
import CoursesPage from "@/features/courses/teacher/pages/CoursesPage.jsx";
import CourseCreatePage from "@/features/courses/teacher/pages/CourseCreatePage.jsx";
import CourseDetailPage from "@/features/courses/teacher/detail/CourseDetailPage.jsx";
import CourseOverviewPage from "@/features/courses/teacher/detail/overview/CourseOverviewPage.jsx";

import CourseLessonsPage from "@/features/lessons/pages/CourseLessonsPage.jsx";
import LessonCreatePage from "@/features/lessons/pages/LessonCreatePage.jsx";
import LessonDetailPage from "@/features/lessons/pages/LessonDetailPage.jsx";

import CourseEnrollmentsPage from "@/features/enrollments/pages/CourseEnrollmentsPage.jsx";

import TeacherNotifications from "@/features/notifications/pages/TeacherNotifications.jsx";

import StudentProfile from "@/features/profile/pages/StudentProfile.jsx";
import PersonalProfilePage from "@/features/profile/pages/PersonalProfilePage.jsx";
import ChangePasswordPage from "@/features/profile/pages/ChangePasswordPage.jsx";
import HelpPage from "@/features/profile/pages/HelpPage.jsx";
import TeacherProfile from "@/features/profile/pages/TeacherProfile.jsx";

const AppRoute = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={<LandingPage />}
            />

            <Route
                element={<GuestRoute />}
            >
                <Route
                    path="/login"
                    element={<LoginPage />}
                />

                <Route
                    path="/register"
                    element={<RegisterPage />}
                />
            </Route>

            <Route element={<ProtectedRoute />}>
                <Route
                    element={
                        <RoleRoute
                            allowedRoles={["STUDENT"]}
                        />
                    }
                >
                    <Route
                        path="/student"
                        element={<StudentLayout />}
                    >
                        <Route
                            index
                            element={
                                <Navigate
                                    to="courses"
                                    replace
                                />
                            }
                        />

                        <Route
                            path="courses"
                            element={<StudentCoursesPage />}
                        />

                        <Route
                            path="courses/:courseId"
                            element={<StudentCourseDetailPage />}
                        />

                        <Route
                            path="explore"
                            element={<ExplorePage />}
                        />

                        <Route
                            path="explore/:courseId"
                            element={<ExploreCourseDetailPage />}
                        />

                        <Route
                            path="profile"
                            element={<StudentProfile />}
                        />

                        <Route
                            path="profile/personal"
                            element={<PersonalProfilePage />}
                        />

                        <Route
                            path="profile/password"
                            element={<ChangePasswordPage />}
                        />

                        <Route
                            path="profile/help"
                            element={<HelpPage />}
                        />

                        <Route
                            path="*"
                            element={
                                <Navigate
                                    to="courses"
                                    replace
                                />
                            }
                        />
                    </Route>
                </Route>

                <Route
                    element={
                        <RoleRoute
                            allowedRoles={["TEACHER"]}
                        />
                    }
                >
                    <Route
                        path="/teacher"
                        element={<TeacherLayout />}
                    >
                        <Route
                            index
                            element={
                                <Navigate
                                    to="courses"
                                    replace
                                />
                            }
                        />

                        <Route
                            path="courses"
                            element={<CoursesPage />}
                        />

                        <Route
                            path="courses/create"
                            element={<CourseCreatePage />}
                        />

                        <Route
                            path="courses/:courseId"
                            element={<CourseDetailPage />}
                        >
                            <Route
                                index
                                element={<CourseOverviewPage />}
                            />

                            <Route
                                path="lessons"
                                element={<CourseLessonsPage />}
                            />

                            <Route
                                path="lessons/create"
                                element={<LessonCreatePage />}
                            />

                            <Route
                                path="lessons/:lessonId"
                                element={<LessonDetailPage />}
                            />

                            <Route
                                path="students"
                                element={<CourseEnrollmentsPage />}
                            />
                        </Route>

                        <Route
                            path="notifications"
                            element={<TeacherNotifications />}
                        />

                        <Route
                            path="profile"
                            element={<TeacherProfile />}
                        />

                        <Route
                            path="*"
                            element={
                                <Navigate
                                    to="courses"
                                    replace
                                />
                            }
                        />
                    </Route>
                </Route>

                <Route
                    element={
                        <RoleRoute
                            allowedRoles={["ADMIN"]}
                        />
                    }
                >
                    <Route
                        path="/admin/*"
                        element={<div>AdminPage</div>}
                    />
                </Route>
            </Route>
        </Routes>
    );
};

export default AppRoute;
