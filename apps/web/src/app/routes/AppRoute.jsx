import { Route, Routes } from "react-router-dom";

import ProtectedRoute from "@/app/routes/ProtectedRoute.jsx";
import GuestRoute from "@/app/routes/GuestRoute.jsx";
import RoleRoute from "@/app/routes/RoleRoute.jsx";

import LoginPage from "@/features/auth/pages/LoginPage.jsx";
import RegisterPage from "@/features/auth/pages/RegisterPage.jsx";
import LandingPage from "@/features/landing/LandingPage.jsx"
import TeacherLayout from "@/components/layout/teacher/TeacherLayout.jsx";
import StudentLayout from "@/components/layout/student/StudentLayout.jsx";

const AppRoute = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={<LandingPage />}
            />

            <Route
                element={
                    <GuestRoute redirectTo="/student" />
                }
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
                        path="/student/*"
                        element={<StudentLayout />}
                    />
                </Route>

                <Route
                    element={
                        <RoleRoute
                            allowedRoles={["TEACHER"]}
                        />
                    }
                >
                    <Route
                        path="/teacher/*"
                        element={<TeacherLayout />}
                    />
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