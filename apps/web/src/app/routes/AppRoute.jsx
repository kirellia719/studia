import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "@/app/routes/ProtectedRoute.jsx";
import GuestRoute from "@/app/routes/GuestRoute.jsx";
import RoleRoute from "@/app/routes/RoleRoute.jsx";

import Loading from "@/components/ui/Loading.jsx";

const StudentLayout = lazy(
    () => import("@/components/layout/student/StudentLayout.jsx")
);
const TeacherLayout = lazy(
    () => import("@/components/layout/teacher/TeacherLayout.jsx")
);

const LoginPage = lazy(
    () => import("@/features/auth/pages/LoginPage.jsx")
);
const RegisterPage = lazy(
    () => import("@/features/auth/pages/RegisterPage.jsx")
);
const LandingPage = lazy(
    () => import("@/features/landing/LandingPage.jsx")
);

const StudentCoursesPage = lazy(
    () => import("@/features/courses/student/StudentCoursesPage.jsx")
);
const StudentCourseDetailPage = lazy(
    () => import("@/features/courses/student/StudentCourseDetailPage.jsx")
);
const ExplorePage = lazy(
    () => import("@/features/courses/explore/ExplorePage.jsx")
);
const ExploreCourseDetailPage = lazy(
    () => import("@/features/courses/explore/ExploreCourseDetailPage.jsx")
);
const CoursesPage = lazy(
    () => import("@/features/courses/teacher/pages/CoursesPage.jsx")
);
const CourseCreatePage = lazy(
    () => import("@/features/courses/teacher/pages/CourseCreatePage.jsx")
);
const CourseDetailPage = lazy(
    () => import("@/features/courses/teacher/detail/CourseDetailPage.jsx")
);
const CourseOverviewPage = lazy(
    () =>
        import(
            "@/features/courses/teacher/detail/overview/CourseOverviewPage.jsx"
        )
);

const CourseLessonsPage = lazy(
    () => import("@/features/lessons/pages/CourseLessonsPage.jsx")
);
const LessonCreatePage = lazy(
    () => import("@/features/lessons/pages/LessonCreatePage.jsx")
);
const LessonDetailPage = lazy(
    () => import("@/features/lessons/pages/LessonDetailPage.jsx")
);

const CourseEnrollmentsPage = lazy(
    () => import("@/features/enrollments/pages/CourseEnrollmentsPage.jsx")
);

const TeacherNotifications = lazy(
    () => import("@/features/notifications/pages/TeacherNotifications.jsx")
);

const StudentProfile = lazy(
    () => import("@/features/profile/pages/StudentProfile.jsx")
);
const PersonalProfilePage = lazy(
    () => import("@/features/profile/pages/PersonalProfilePage.jsx")
);
const ChangePasswordPage = lazy(
    () => import("@/features/profile/pages/ChangePasswordPage.jsx")
);
const HelpPage = lazy(
    () => import("@/features/profile/pages/HelpPage.jsx")
);
const TeacherProfile = lazy(
    () => import("@/features/profile/pages/TeacherProfile.jsx")
);

const AppRoute = () => {
    return (
        <Suspense
            fallback={<Loading text="Đang tải trang..." />}
        >
            <Routes>
                <Route
                    path="/"
                    element={<LandingPage />}
                />

                <Route element={<GuestRoute />}>
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
        </Suspense>
    );
};

export default AppRoute;
