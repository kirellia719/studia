import { Outlet } from "react-router-dom";

import TeacherSidebar from "@/components/layout/teacher/TeacherSidebar.jsx";

const TeacherLayout = () => {
    return (
        <div className="app-canvas flex min-h-dvh flex-col">
            <TeacherSidebar />

            <main
                className={[
                    // Mobile
                    "flex-1",

                    // Desktop
                    "lg:ml-64",
                    "lg:pt-0",
                ].join(" ")}
            >
                <Outlet />
            </main>
        </div>
    );
};

export default TeacherLayout;
