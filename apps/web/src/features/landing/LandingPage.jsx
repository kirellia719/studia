import { Link } from "react-router-dom";

import {
    ArrowRight,
    BookOpen,
    Clock3,
    GraduationCap,
    Heart,
    Languages,
} from "lucide-react";

import Brand from "@/components/ui/Brand.jsx";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher.jsx";

const LandingPage = () => {
    return (
        <div className="flex min-h-screen flex-col overflow-x-hidden bg-[var(--surface)] text-[var(--ink)]">
            {/* Header */}
            <header className="relative z-30 border-b border-[var(--line)] bg-[var(--surface)]/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
                <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between sm:h-[76px]">
                    {/* Brand */}
                    <div className="flex items-center">
                        <Brand width={140} />
                    </div>

                    {/* Theme + Login */}
                    <div className="flex items-center gap-2">
                        <ThemeSwitcher variant="floating" />

                        <Link
                            to="/login"
                        className="
                            shrink-0
                            rounded-xl
                            border border-[var(--line)]
                            bg-[var(--surface)]
                            px-4 py-2.5
                            text-xs font-bold
                            text-[var(--brand-text)]
                            shadow-[0_2px_8px_rgba(0,0,0,0.04)]
                            transition-all duration-200
                            hover:border-[var(--brand)]
                            hover:bg-[var(--brand)]
                            hover:text-[var(--on-brand)]
                            hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)]
                            sm:px-5 sm:text-sm
                        "
                    >
                        Đăng nhập
                    </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero */}
                <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 md:px-8 md:pb-24 md:pt-16 lg:px-10 lg:pb-28 lg:pt-20">
                    {/* Background */}
                    <div className="pointer-events-none absolute inset-0">
                        {/* Blue glow */}
                        <div className="absolute -right-[180px] -top-[180px] h-[420px] w-[420px] rounded-full bg-[var(--brand-soft)]/70 blur-[90px] sm:h-[520px] sm:w-[520px]" />

                        {/* Mint glow */}
                        <div className="absolute -bottom-[180px] -left-[180px] h-[400px] w-[400px] rounded-full bg-[var(--success-soft)]/70 blur-[90px] sm:h-[500px] sm:w-[500px]" />

                        {/* Warm learning glow */}
                        <div className="absolute -bottom-[150px] right-[8%] h-[330px] w-[330px] rounded-full bg-[var(--accent-soft)]/50 blur-[100px]" />

                        {/* Subtle grid */}
                        <div
                            className="absolute inset-0 opacity-[0.22]"
                            style={{
                                backgroundImage:
                                    "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
                                backgroundSize: "48px 48px",
                                maskImage:
                                    "radial-gradient(circle at center, black 0%, transparent 72%)",
                                WebkitMaskImage:
                                    "radial-gradient(circle at center, black 0%, transparent 72%)",
                            }}
                        />

                        {/* Accent dots */}
                        <div className="absolute right-[9%] top-[18%] h-2 w-2 rounded-full bg-[var(--brand)]/50" />
                        <div className="absolute left-[6%] top-[40%] h-2 w-2 rounded-full bg-[var(--accent)]/60" />

                        {/* Chữ Lào mờ — chất liệu học tập */}
                        <div
                            aria-hidden="true"
                            className="absolute -left-4 bottom-[12%] hidden select-none text-[170px] font-black leading-none text-[var(--brand-text)] opacity-[0.07] lg:block"
                        >
                            ກ
                        </div>

                        <div
                            aria-hidden="true"
                            className="absolute right-[6%] top-[6%] hidden select-none text-[150px] font-black leading-none text-[var(--accent)] opacity-[0.09] lg:block"
                        >
                            ຂ
                        </div>

                        {/* Vòng cung trang trí */}
                        <div
                            aria-hidden="true"
                            className="absolute -left-24 top-[24%] hidden h-72 w-72 rounded-full border border-[var(--brand)]/15 lg:block"
                        />
                    </div>

                    <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 xl:gap-24">
                        {/* Hero Visual */}
                        <div className="relative flex w-full justify-center lg:justify-start">
                            {/* Glow behind card */}
                            <div className="absolute h-[280px] w-[280px] rounded-full bg-[var(--brand-soft)]/80 blur-[60px] sm:h-[380px] sm:w-[380px]" />

                            {/* Main SaaS card */}
                            <div
                                className="
                                    relative
                                    flex aspect-square
                                    w-[min(84vw,330px)]
                                    items-center justify-center
                                    overflow-visible
                                    rounded-[24px]
                                    border border-white
                                    bg-[var(--surface)]/95
                                    shadow-[0_25px_80px_-30px_rgba(0,0,0,0.20)]
                                    backdrop-blur-xl
                                    sm:w-[370px]
                                    sm:rounded-[24px]
                                    md:w-[410px]
                                    lg:w-[420px]
                                    xl:w-[440px]
                                "
                            >
                                {/* Soft top gradient */}
                                <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
                                    <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[var(--brand-soft)]/70 blur-3xl" />

                                    <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-[var(--accent-soft)]/60 blur-3xl" />
                                </div>

                                {/* Inner frame */}
                                <div className="absolute inset-3.5 rounded-[22px] border border-[var(--line)] sm:inset-5 sm:rounded-[26px]" />

                                {/* Browser-like dots */}
                                <div className="absolute left-6 top-6 z-10 flex items-center gap-1.5 sm:left-8 sm:top-8">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)] sm:h-2 sm:w-2" />
                                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] sm:h-2 sm:w-2" />
                                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--line)] sm:h-2 sm:w-2" />
                                </div>

                                {/* Decorative ring */}
                                <div className="absolute h-[70%] w-[70%] rounded-full border border-[var(--brand)]/[0.10]" />

                                {/* Gold dot */}
                                <div className="absolute -right-1 top-14 z-20 h-4 w-4 rounded-full bg-[var(--accent)] shadow-[0_6px_18px_rgba(232,154,0,0.20)] sm:right-1 sm:top-16 sm:h-5 sm:w-5" />

                                {/* Blue dot */}
                                <div className="absolute -left-1 top-24 z-20 h-3 w-3 rounded-full bg-[var(--brand)]/70 sm:left-1 sm:top-28 sm:h-3.5 sm:w-3.5" />

                                {/* Bottom accent */}
                                <div className="absolute bottom-9 right-7 h-2.5 w-2.5 rounded-full bg-[var(--accent)]/65 sm:bottom-12 sm:right-9 sm:h-3 sm:w-3" />

                                {/* Plus */}
                                <div className="absolute bottom-7 left-7 text-xl font-light text-[var(--brand-text)]/30 sm:bottom-9 sm:left-9 sm:text-2xl">
                                    +
                                </div>

                                {/* Logo */}
                                <div className="relative z-10 w-[67%] sm:w-[72%]">
                                    <img
                                        src="/badge-amber.png"
                                        alt="Achan - Học tiếng Lào"
                                        className="
                                            h-auto
                                            w-full
                                            drop-shadow-[0_18px_25px_rgba(0,0,0,0.14)]
                                        "
                                    />
                                </div>

                                {/* Floating information card */}
                                <div className="absolute -bottom-4 -right-2 z-20 hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 shadow-[0_14px_35px_-15px_rgba(0,0,0,0.20)] sm:block sm:-right-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-3)]">
                                            <Languages
                                                size={16}
                                                className="text-[var(--brand-text)]"
                                            />
                                        </div>

                                        <div>
                                            <p className="text-[12px] font-medium text-[var(--faint)]">
                                                Learning
                                            </p>

                                            <p className="text-xs font-bold text-[var(--ink)]">
                                                Tiếng Lào
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hero Content */}
                        <div className="w-full text-center lg:text-left">
                            {/* Badge */}
                            <div
                                className="
                                    mb-5
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-full
                                    border border-[var(--line)]
                                    bg-[var(--surface)]/90
                                    px-3.5 py-2
                                    text-[12px] font-bold
                                    text-[var(--brand-text)]
                                    shadow-[0_4px_14px_rgba(0,0,0,0.06)]
                                    backdrop-blur-sm
                                    sm:mb-6 sm:px-4 sm:text-xs
                                "
                            >
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--surface-3)]">
                                    <Languages
                                        size={13}
                                        className="text-[var(--brand-text)]"
                                    />
                                </span>

                                <span>Học tiếng Lào cùng Achan</span>
                            </div>

                            {/* Heading */}
                            <h1
                                className="
                                    text-[2.75rem]
                                    font-black
                                    leading-[1.02]
                                    tracking-[-0.05em]
                                    text-[var(--ink)]
                                    sm:text-5xl
                                    md:text-6xl
                                    lg:text-[4rem]
                                    xl:text-[4.5rem]
                                "
                            >
                                Tiếng Lào

                                <span className="mt-1 block bg-gradient-to-r from-[var(--brand-strong)] via-[var(--brand-text)] to-[var(--brand-strong)] bg-clip-text pb-2 text-transparent">
                                    không khó
                                </span>
                            </h1>

                            {/* Slogan */}
                            <div className="mt-5 flex items-center justify-center gap-2 sm:gap-3 lg:justify-start">
                                <div className="h-px w-7 bg-[var(--accent)] sm:w-9" />

                                <p className="flex items-center text-base font-bold italic text-[var(--accent)] sm:text-lg md:text-xl">
                                    vì có Achan

                                    <span className="ml-1 flex">
                                        <Heart
                                            size={18}
                                            fill="currentColor"
                                            className="text-[var(--accent)]"
                                        />
                                    </span>
                                </p>

                                <div className="h-px w-7 bg-[var(--accent)] sm:w-9" />
                            </div>

                            {/* Description */}
                            <p className="mx-auto mt-6 max-w-xl text-left text-sm leading-6 text-[var(--faint)] sm:mt-7 sm:text-base sm:leading-7 md:text-lg md:leading-8 lg:mx-0">
                                Học tiếng Lào theo cách đơn giản, dễ hiểu, mọi lúc mọi nơi, cho mọi đối tượng. Từng bài học nhỏ giúp bạn tự tin hơn
                                trong việc nghe, nói, đọc và sử dụng tiếng Lào
                                mỗi ngày.
                            </p>

                            {/* CTA */}
                            <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row lg:justify-start">
                                <Link
                                    to="/login"
                                    className="
                                        group
                                        flex min-h-[50px]
                                        w-full items-center justify-center gap-2
                                        rounded-xl
                                        bg-[var(--brand)]
                                        px-6 py-3.5
                                        text-sm font-bold text-white
                                        shadow-[0_12px_28px_-10px_rgba(232,154,0,0.35)]
                                        transition-all duration-200
                                        hover:-translate-y-0.5
                                        hover:bg-[var(--brand-solid)]
                                        hover:shadow-[0_18px_34px_-10px_rgba(232,154,0,0.40)]
                                        sm:w-auto sm:px-7
                                    "
                                >
                                    Bắt đầu học tiếng Lào

                                    <ArrowRight
                                        size={17}
                                        className="transition-transform duration-200 group-hover:translate-x-1"
                                    />
                                </Link>

                                <Link
                                    to="/register"
                                    className="
                                        flex min-h-[50px]
                                        w-full items-center justify-center
                                        rounded-xl
                                        border border-[var(--line)]
                                        bg-[var(--surface)]
                                        px-6 py-3.5
                                        text-sm font-bold
                                        text-[var(--ink)]
                                        shadow-[0_3px_10px_rgba(0,0,0,0.04)]
                                        transition-all duration-200
                                        hover:-translate-y-0.5
                                        hover:border-[var(--brand)]/40
                                        hover:text-[var(--brand-text)]
                                        hover:shadow-[0_10px_22px_rgba(0,0,0,0.08)]
                                        sm:w-auto sm:px-7
                                    "
                                >
                                    Tạo tài khoản
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Feature strip */}
                    <div className="relative mx-auto mt-14 grid w-full max-w-6xl gap-3 sm:grid-cols-3 sm:gap-4 lg:mt-20">
                        {[
                            {
                                icon: BookOpen,
                                title: "Bài học ngắn, dễ hiểu",
                                text: "Chia nhỏ kiến thức để bạn học đều mỗi ngày.",
                            },
                            {
                                icon: GraduationCap,
                                title: "Lộ trình rõ ràng",
                                text: "Theo dõi tiến độ và biết mình cần học gì tiếp.",
                            },
                            {
                                icon: Clock3,
                                title: "Học mọi lúc, mọi nơi",
                                text: "Mở máy là học, trên điện thoại hay máy tính.",
                            },
                        ].map(({ icon: Icon, title, text }) => (
                            <div
                                key={title}
                                className="flex items-start gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)]/85 p-4 shadow-[0_10px_30px_-22px_var(--ring)] backdrop-blur-sm"
                            >
                                <span className="brand-tile flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                                    <Icon size={19} strokeWidth={2} />
                                </span>

                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-[var(--ink)]">
                                        {title}
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                                        {text}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Footer */}
            {/* <footer className="border-t border-[var(--line)] bg-[var(--surface)] px-4 py-6 sm:px-6 sm:py-7 md:px-8">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
                    <p className="text-[12px] font-medium text-[var(--faint)] sm:text-xs">
                        © {new Date().getFullYear()} Achan
                    </p>
                </div>
            </footer> */}
        </div>
    );
};

export default LandingPage;
