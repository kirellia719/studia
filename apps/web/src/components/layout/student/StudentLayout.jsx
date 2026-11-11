import { Outlet } from "react-router-dom";
import { useRef } from "react";

import ScrollToTop from "@/components/ui/ScrollToTop.jsx";

import StudentSidebar from "@/components/layout/student/StudentSidebar.jsx";
import StudentBottomNav from "@/components/layout/student/StudentBottomNav.jsx";

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
                <Outlet />
            </main>
        </div>
    );
};

export default StudentLayout;
