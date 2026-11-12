import {
    ChevronRight,
    LockKeyhole,
    LogOut,
    UserRound,
    Pencil,
} from "lucide-react";

import useAuthStore from "@/stores/authStore";

const ProfilePage = () => {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = logout;

    const menuItems = [
        {
            label: "Thông tin cá nhân",
            description: "Tên, email và ảnh đại diện",
            icon: UserRound,
            path: "/teacher/profile/personal",
        },
        {
            label: "Đổi mật khẩu",
            description: "Thay đổi mật khẩu tài khoản",
            icon: LockKeyhole,
            path: "/teacher/profile/password",
        },
        // {
        //     label: "Cài đặt",
        //     description: "Tùy chỉnh tài khoản",
        //     icon: Settings2,
        //     path: "/teacher/profile/settings",
        // },
        // {
        //     label: "Trợ giúp",
        //     description: "Hỗ trợ và giải đáp",
        //     icon: CircleHelp,
        //     path: "/teacher/profile/help",
        // },
    ];

    const getInitial = (name) => {
        return name?.charAt(0)?.toUpperCase() || "U";
    };

    return (
        <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden bg-[var(--brand-tint)] lg:min-h-dvh">
            {/* =========================
                Decorative background
            ========================== */}

            {/* Purple blob */}
            <div
                className="
                    pointer-events-none
                    absolute
                    -right-20
                    -top-24
                    h-64
                    w-64
                    rounded-full
                    bg-[var(--brand-soft)]
                    opacity-70
                    blur-3xl
                "
            />

            {/* Blue blob */}
            <div
                className="
                    pointer-events-none
                    absolute
                    -left-24
                    top-[260px]
                    h-56
                    w-56
                    rounded-full
                    bg-[var(--brand-soft)]
                    opacity-60
                    blur-3xl
                "
            />

            {/* Pink blob */}
            <div
                className="
                    pointer-events-none
                    absolute
                    -right-24
                    top-[430px]
                    h-52
                    w-52
                    rounded-full
                    bg-[var(--accent-soft)]
                    opacity-50
                    blur-3xl
                "
            />

            {/* Decorative circles */}
            <div
                className="
                    pointer-events-none
                    absolute
                    left-5
                    top-10
                    h-3
                    w-3
                    rounded-full
                    bg-[var(--brand-solid)]
                    opacity-60
                "
            />

            <div
                className="
                    pointer-events-none
                    absolute
                    right-8
                    top-32
                    h-2
                    w-2
                    rounded-full
                    bg-[var(--brand-solid)]
                    opacity-70
                "
            />

            <div
                className="
                    pointer-events-none
                    absolute
                    left-10
                    top-[410px]
                    h-2
                    w-2
                    rounded-full
                    bg-[var(--accent)]
                    opacity-60
                "
            />

            {/* =========================
                Content
            ========================== */}

            <div className="relative z-10 mx-auto w-full max-w-[375px] p-4">

                {/* Header */}
                <header className="mb-5 flex items-center justify-center">
                    <h1 className="text-[18px] font-semibold text-[var(--ink)]">
                        Hồ sơ
                    </h1>
                </header>

                {/* =========================
                    Profile Hero
                ========================== */}

                <section className="flex flex-col items-center">

                    {/* Avatar */}
                    <div className="relative">

                        {/* Outer glow */}
                        <div
                            className="
                                absolute
                                inset-[-8px]
                                rounded-full
                                bg-gradient-to-br
                                from-[var(--brand-soft)]
                                via-[var(--brand-soft)]
                                to-[var(--brand-tint)]
                                opacity-70
                                blur-md
                            "
                        />

                        {/* Avatar */}
                        <div
                            className="
                                relative
                                flex
                                h-[96px]
                                w-[96px]
                                items-center
                                justify-center
                                overflow-hidden
                                rounded-full
                                border-4
                                border-white
                                bg-gradient-to-br
                                from-[var(--brand-soft)]
                                via-[var(--brand-soft)]
                                to-[var(--brand-tint)]
                                shadow-[0_8px_25px_rgba(0,0,0,0.10)]
                            "
                        >
                            {user?.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="text-[34px] font-semibold text-[var(--brand-text)]">
                                    {getInitial(user?.name)}
                                </span>
                            )}
                        </div>

                        {/* Edit avatar */}
                        <button
                            type="button"
                            aria-label="Đổi ảnh đại diện"
                            className="
                                group
                                absolute
                                bottom-0
                                right-0
                                flex
                                h-11
                                w-11
                                items-center
                                justify-center
                                rounded-full
                            "
                        >
                            <span
                                className="
                                    flex h-8 w-8 items-center justify-center
                                    rounded-full border-[3px] border-white
                                    bg-[var(--brand-solid)] text-white
                                    shadow-[0_4px_10px_rgba(0,0,0,0.12)]
                                    transition
                                    group-hover:bg-[var(--brand-solid-hover)]
                                    group-active:scale-95
                                "
                            >
                                <Pencil
                                    size={13}
                                    strokeWidth={2}
                                />
                            </span>
                        </button>
                    </div>

                    {/* Name */}
                    <h2 className="mt-3 text-[19px] font-semibold text-[var(--ink)]">
                        {user?.name}
                    </h2>

                    {/* Email */}
                    <p className="mt-0.5 text-[13px] text-[var(--faint)]">
                        {user?.email}
                    </p>

                    {/* Role */}
                    <div
                        className="
                            mt-2
                            rounded-full
                            bg-gradient-to-r
                            from-[var(--brand-soft)]
                            to-[var(--brand-soft)]
                            px-3.5
                            py-1
                            text-[12px]
                            font-semibold
                            text-[var(--brand-text)]
                            shadow-sm
                            ring-1
                            ring-[var(--brand-soft)]
                        "
                    >
                        Giáo viên
                    </div>
                </section>

                {/* =========================
                    Menu
                ========================== */}

                <section
                    className="
        mt-7
        overflow-hidden
        rounded-2xl
        border
        border-white/80
        bg-[var(--surface)]/90
        shadow-[0_8px_30px_rgba(68,55,130,0.08)]
        backdrop-blur-sm
    "
                >
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.label}
                                type="button"
                                className={`
                    group
                    flex
                    w-full
                    items-center
                    gap-3
                    px-4
                    py-[14px]
                    text-left
                    transition
                    hover:bg-[var(--brand-soft)]
                    active:bg-[var(--brand-soft)]
                    ${index !== menuItems.length - 1
                                        ? "border-b border-[var(--line)]"
                                        : ""
                                    }
                `}
                            >
                                {/* Icon */}
                                <div
                                    className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-[11px]
                        bg-[var(--brand-soft)]
                        text-[var(--muted)]
                    "
                                >
                                    <Icon
                                        size={17}
                                        strokeWidth={1.8}
                                    />
                                </div>

                                {/* Text */}
                                <div className="min-w-0 flex-1">
                                    <p className="text-[13px] font-semibold text-[var(--ink)]">
                                        {item.label}
                                    </p>

                                    <p className="mt-0.5 truncate text-[12px] text-[var(--faint)]">
                                        {item.description}
                                    </p>
                                </div>

                                {/* Arrow */}
                                <ChevronRight
                                    size={17}
                                    strokeWidth={1.8}
                                    className="
                        shrink-0
                        text-[var(--faint)]
                        transition-all
                        group-hover:translate-x-0.5
                        group-hover:text-[var(--brand-text)]
                    "
                                />
                            </button>
                        );
                    })}
                </section>

                {/* =========================
                    Logout
                ========================== */}

                <div className="mt-5 flex justify-center">
                    <button
                        type="button"
                        className="
            flex
            min-w-[150px]
            items-center
            justify-center
            gap-2
            rounded-full
            border
            border-red-100
            bg-[var(--surface)]
            px-6
            py-3
            text-[13px]
            font-semibold
            text-[var(--danger)]
            shadow-[0_6px_20px_rgba(239,68,68,0.08)]
            transition-all
            hover:border-red-200
            hover:bg-[var(--danger-soft)]
            hover:shadow-[0_8px_24px_rgba(239,68,68,0.12)]
            active:scale-95
        "
                        onClick={handleLogout}
                    >
                        <LogOut
                            size={16}
                            strokeWidth={1.9}
                        />

                        <span>Đăng xuất</span>
                    </button>
                </div>

                {/* =========================
                    Branding
                ========================== */}

                <div className="mt-6 text-center">
                    <div className="mx-auto mb-2 h-1 w-8 rounded-full bg-gradient-to-r from-[var(--brand-solid)] to-[var(--brand-solid)]" />

                    <p className="text-[12px] font-semibold text-[var(--faint)]">
                        Stady
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
