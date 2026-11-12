import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";

import SidebarBrand from "@/components/ui/SidebarBrand.jsx";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher.jsx";
import useAuthStore from "@/stores/authStore";
import studentMenuItems from "@/components/layout/student/studentMenuItems.js";

const StudentSidebar = () => {
    const navigate = useNavigate();

    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <aside
            className={[
                "fixed inset-y-0 left-0 z-40",
                "hidden lg:flex",
                "w-64 flex-col",
                "border-r border-[var(--line)]",
                "bg-[var(--surface)]",
            ].join(" ")}
        >
            <div className="page-band flex h-16 shrink-0 items-center px-4">
                <SidebarBrand />
            </div>

            <nav
                aria-label="Điều hướng chính"
                className="flex-1 px-3 py-5"
            >
                <div className="space-y-1">
                    {studentMenuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.end}
                                className={({ isActive }) =>
                                    [
                                        "group relative flex items-center gap-3",
                                        "rounded-lg px-3 py-2.5 pl-4",
                                        "text-[14px] font-medium",
                                        isActive
                                            ? "bg-[var(--brand-soft)] font-semibold text-[var(--brand-text)]"
                                            : "text-[var(--muted)] hover:bg-[var(--surface-3)] hover:text-[var(--brand-text)]",
                                    ].join(" ")
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <span
                                            className={[
                                                "absolute left-0 top-1/2",
                                                "-translate-y-1/2",
                                                "h-6 w-[4px]",
                                                "rounded-r-full",
                                                isActive
                                                    ? "bg-[var(--brand-solid)]"
                                                    : "opacity-0",
                                            ].join(" ")}
                                        />

                                        <Icon
                                            size={19}
                                            strokeWidth={
                                                isActive
                                                    ? 2.1
                                                    : 1.8
                                            }
                                            className={
                                                isActive
                                                    ? "text-[var(--brand-text)]"
                                                    : "text-[var(--muted)] group-hover:text-[var(--brand-text)]"
                                            }
                                        />

                                        <span>
                                            {item.label}
                                        </span>
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </div>
            </nav>

            <div className="border-t border-[var(--line)] p-3">
                <div className="flex items-center gap-3 px-2 py-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand-text)] ring-1 ring-[var(--brand)]/20">
                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                alt="Avatar"
                                className="h-full w-full rounded-full object-cover"
                            />
                        ) : (
                            <User size={18} strokeWidth={1.8} />
                        )}
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-[var(--ink)]">
                            {user?.fullName ||
                                user?.name ||
                                "Học viên"}
                        </p>

                        <p className="truncate text-[12px] text-[var(--muted)]">
                            {user?.email ||
                                "Tài khoản học viên"}
                        </p>
                    </div>
                </div>

                <ThemeSwitcher className="mt-2" />

                <button
                    type="button"
                    onClick={handleLogout}
                    className={[
                        "mt-2 flex w-full items-center gap-3",
                        "rounded-full px-3 py-2.5",
                        "text-[14px] font-medium text-[var(--muted)]",
                        "transition-colors duration-150",
                        "hover:bg-[var(--danger-soft)]",
                        "hover:text-[var(--danger)]",
                    ].join(" ")}
                >
                    <LogOut size={18} strokeWidth={1.9} />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
};

export default StudentSidebar;
