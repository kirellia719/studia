import { Outlet } from "react-router-dom";

import TeacherSidebar from "@/components/layout/teacher/TeacherSidebar.jsx";

const TeacherLayout = () => {
    return (
        <div className="min-h-dvh bg-[#F7F7FF]">
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
