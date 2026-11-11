import { Outlet } from "react-router-dom";

import TeacherSidebar from "@/components/layout/teacher/TeacherSidebar.jsx";

const TeacherLayout = () => {
    return (
        <div className="app-canvas min-h-dvh">
            <TeacherSidebar />

            <main
                className={[
                    // Mobile
                    "min-h-dvh",

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
