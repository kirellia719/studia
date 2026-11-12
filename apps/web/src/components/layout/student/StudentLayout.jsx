import { Outlet } from "react-router-dom";
import { useRef } from "react";

import ScrollToTop from "@/components/ui/ScrollToTop.jsx";

import StudentSidebar from "@/components/layout/student/StudentSidebar.jsx";
import StudentBottomNav from "@/components/layout/student/StudentBottomNav.jsx";

const StudentLayout = () => {
    const mainRef = useRef(null);

    return (
        <div className="app-canvas min-h-dvh">
            <ScrollToTop scrollRef={mainRef} />

            <StudentSidebar />
            <StudentBottomNav />

            <main
                ref={mainRef}
                className={[
                    "h-dvh",
                    "overflow-y-auto",
                    "app-canvas",
                    "pb-[calc(4rem_+_env(safe-area-inset-bottom))]",
                    "lg:ml-64",
                    "lg:pb-0",
                ].join(" ")}
            >
                <Outlet />
            </main>
        </div>
    );
};

export default StudentLayout;
