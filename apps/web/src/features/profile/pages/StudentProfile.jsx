import {
    ChevronRight,
    CircleHelp,
    GraduationCap,
    LogOut,
    Settings2,
    UserRound,
    LockKeyhole,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/stores/authStore";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher.jsx";

const ProfilePage = () => {
    const navigate = useNavigate();

    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    const menuItems = [
        {
            label: "Thông tin cá nhân",
            description: "Tên, email và ảnh đại diện",
            icon: UserRound,
            path: "/student/profile/personal",
        },
        // {
        //     label: "Cài đặt",
        //     description: "Tùy chỉnh tài khoản",
        //     icon: Settings2,
        //     path: "/student/profile/settings",
        // },
        {
            label: "Đổi mật khẩu",
            description: "Thay đổi mật khẩu tài khoản",
            icon: LockKeyhole,
            path: "/student/profile/password",
        },
        {
            label: "Trợ giúp",
            description: "Hỗ trợ và giải đáp",
            icon: CircleHelp,
            path: "/student/profile/help",
        },
    ];

    const getInitial = (name) => {
        return name?.charAt(0)?.toUpperCase() || "U";
    };

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <div className="min-h-full bg-[var(--surface-3)] text-[var(--ink)]">
            {/* HEADER */}
            <header className="page-band sticky top-0 z-30 h-16">
                <div className="mx-auto flex h-full w-full max-w-[720px] items-center justify-between px-4 sm:px-6">
                    <h1 className="text-[17px] font-semibold text-[var(--ink)]">
                        Hồ sơ
                    </h1>

                    <ThemeSwitcher variant="floating" className="lg:hidden" />
                </div>
            </header>

            <div className="mx-auto w-full max-w-[720px] px-4 pb-10 pt-5 sm:px-6">
                {/* PROFILE CARD */}
                <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-5 py-6 shadow-sm">
                    <div className="flex flex-col items-center text-center sm:flex-row sm:text-left">
                        {/* AVATAR */}
                        <div className="relative shrink-0">
                            <div className="flex h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-full bg-[var(--brand-soft)] ring-1 ring-[var(--brand-soft)]">
                                {user?.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="text-2xl font-semibold text-[var(--brand-text)]">
                                        {getInitial(user?.name)}
                                    </span>
                                )}
                            </div>

                            <button
                                type="button"
                                aria-label="Đổi ảnh đại diện"
                                onClick={() =>
                                    navigate("/student/profile/personal")
                                }
                                className="group absolute bottom-0 right-0 flex h-11 w-11 items-center justify-center rounded-full"
                            >
                                <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[var(--brand-solid)] text-white shadow-sm transition group-hover:bg-[var(--brand-solid-hover)] group-active:scale-95">
                                    <UserRound
                                        size={13}
                                        strokeWidth={1.8}
                                    />
                                </span>
                            </button>
                        </div>

                        {/* USER INFO */}
                        <div className="mt-4 min-w-0 sm:ml-5 sm:mt-0">
                            <h2 className="truncate text-[17px] font-semibold text-[var(--ink)]">
                                {user?.name || "Học sinh"}
                            </h2>

                            <p className="mt-1 max-w-[280px] truncate text-[12px] text-[var(--muted)] sm:max-w-[360px]">
                                {user?.email || "Chưa cập nhật email"}
                            </p>

                            <div className="mt-2.5 flex items-center justify-center gap-2 sm:justify-start">
                                <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-[12px] font-medium text-[var(--brand-text)]">
                                    <GraduationCap
                                        size={13}
                                        strokeWidth={1.8}
                                    />
                                    <span>Học sinh</span>
                                </div>

                                {user?.studentCode && (
                                    <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-[12px] font-medium text-[var(--muted)]">
                                        {user.studentCode}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* MENU */}
                <section className="mt-5 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-sm">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.label}
                                type="button"
                                onClick={() => navigate(item.path)}
                                className={`flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition hover:bg-[var(--surface-3)] active:bg-[var(--surface-2)] ${index !== menuItems.length - 1
                                    ? "border-b border-[var(--surface-2)]"
                                    : ""
                                    }`}
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--muted)]">
                                    <Icon
                                        size={17}
                                        strokeWidth={1.8}
                                    />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-[13px] font-medium text-[var(--ink)]">
                                        {item.label}
                                    </p>

                                    <p className="mt-0.5 truncate text-[12px] text-[var(--muted)]">
                                        {item.description}
                                    </p>
                                </div>

                                <ChevronRight
                                    size={17}
                                    strokeWidth={1.7}
                                    className="shrink-0 text-[var(--faint)]"
                                />
                            </button>
                        );
                    })}
                </section>

                {/* LOGOUT */}
                <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-[var(--danger-soft)] bg-[var(--surface)] py-3 text-[13px] font-medium text-[var(--danger)] transition hover:bg-[var(--danger-soft)] active:bg-[var(--danger-soft)]"
                >
                    <LogOut
                        size={16}
                        strokeWidth={1.8}
                    />

                    <span>Đăng xuất</span>
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;
