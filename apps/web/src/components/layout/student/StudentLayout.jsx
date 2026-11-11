import { useRef } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import ScrollToTop from "@/components/ui/ScrollToTop.jsx";

import StudentSidebar from "@/components/layout/student/StudentSidebar.jsx";

import StudentCoursesPage from "@/features/courses/student/StudentCoursesPage.jsx";
import StudentCourseDetailPage from "@/features/courses/student/StudentCourseDetailPage.jsx";

import ExplorePage from "@/features/courses/explore/ExplorePage.jsx";
import ExploreCourseDetailPage from "@/features/courses/explore/ExploreCourseDetailPage.jsx";

import ProfilePage from "@/features/profile/pages/StudentProfile.jsx";
import StudentBottomNav from "@/components/layout/student/StudentBottomNav.jsx";
import HelpPage from "@/features/profile/pages/HelpPage.jsx";
import ChangePasswordPage from "@/features/profile/pages/ChangePasswordPage.jsx";
import PersonalProfilePage from "@/features/profile/pages/PersonalProfilePage.jsx";

const StudentLayout = () => {
    const mainRef = useRef(null);

    return (
        <div className="min-h-dvh bg-[#F8FAFC]">
            <ScrollToTop scrollRef={mainRef} />

            <StudentSidebar />
            <StudentBottomNav />

            <main
                ref={mainRef}
                className={[
                    "min-h-dvh",
                    "overflow-y-auto",
                    "bg-[#F8FAFC]",
                    "pb-16",
                    "lg:ml-64",
                    "lg:h-dvh",
                    "lg:min-h-0",
                    "lg:overflow-y-auto",
                    "lg:pb-0",
                ].join(" ")}
            >
                <Routes>
                    {/* Default */}
                    <Route
                        index
                        element={
                            <Navigate
                                to="courses"
                                replace
                            />
                        }
                    />

                    {/* Học tập */}
                    <Route
                        path="courses"
                        element={<StudentCoursesPage />}
                    />

                    <Route
                        path="courses/:courseId"
                        element={<StudentCourseDetailPage />}
                    />

                    {/* Khám phá */}
                    <Route
                        path="explore/:courseId"
                        element={<ExploreCourseDetailPage />}
                    />
                    <Route
                        path="explore"
                        element={<ExplorePage />}
                    />



                    {/* Tài khoản */}
                    <Route
                        path="profile"
                        element={<ProfilePage />}
                    />
                    <Route
                        path="profile/personal"
                        element={<PersonalProfilePage />}
                    />
                    {/* <Route
                        path="profile/settings"
                        element={<ProfileSettingsPage />}
                    /> */}
                    <Route
                        path="profile/password"
                        element={<ChangePasswordPage />}
                    />
                    <Route
                        path="profile/help"
                        element={<HelpPage />}
                    />

                    {/* Fallback */}
                    <Route
                        path="*"
                        element={
                            <Navigate
                                to="courses"
                                replace
                            />
                        }
                    />
                </Routes>
            </main>
        </div>
    );
};

export default StudentLayout;