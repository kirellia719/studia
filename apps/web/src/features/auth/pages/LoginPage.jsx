import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  BookOpen,
  Eye,
  EyeOff,
  GraduationCap,
  Lightbulb,
  LockKeyhole,
  Mail,
  Pencil,
  Sparkles,
} from "lucide-react";

import Logo from "@/components/ui/Logo.jsx";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher.jsx";
import authApi from "@/features/auth/api.js";
import toast from "@/lib/toast.js";
import { getRoleHome } from "@/lib/roles.js";

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const { data } = await authApi.login({
        email: email.trim(),
        password,
      });

      const role = data?.user?.role;

      navigate(role ? getRoleHome(role) : "/student");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error.message ||
        "Đăng nhập không thành công."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg)] px-4 py-6 sm:px-6 sm:py-8">
      <div className="absolute right-4 top-4 z-40 sm:right-6 sm:top-6">
        <ThemeSwitcher variant="floating" />
      </div>

      {/* ==================================================
          Soft EdTech Background
      ================================================== */}

      {/* Large soft blue glow */}
      <div className="pointer-events-none absolute left-1/2 top-[5%] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[var(--brand-soft)]/70 blur-[90px] sm:h-[560px] sm:w-[560px]" />

      {/* Warm glow */}
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-[380px] w-[380px] rounded-full bg-[var(--brand-soft)]/50 blur-[100px]" />

      {/* Warm learning accent */}
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-[300px] w-[300px] rounded-full bg-[var(--accent-soft)]/60 blur-[100px]" />

      {/* Very subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.28]"
        style={{
          backgroundImage:
            "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(circle at center, black 0%, transparent 72%)",
          WebkitMaskImage:
            "radial-gradient(circle at center, black 0%, transparent 72%)",
        }}
      />

      {/* Decorative dots */}
      <div className="pointer-events-none absolute left-[10%] top-[23%] h-2 w-2 rounded-full bg-[var(--brand)]/60" />
      <div className="pointer-events-none absolute right-[12%] top-[27%] h-2.5 w-2.5 rounded-full bg-[var(--accent)]/70" />
      <div className="pointer-events-none absolute bottom-[23%] left-[14%] h-1.5 w-1.5 rounded-full bg-[var(--accent)]/60" />
      <div className="pointer-events-none absolute bottom-[18%] right-[14%] h-2 w-2 rounded-full bg-[var(--brand)]/50" />

      {/* ==================================================
          Floating Education Objects
      ================================================== */}

      {/* Book */}
      <div className="group pointer-events-none absolute left-[calc(50%-390px)] top-[29%] hidden sm:block lg:pointer-events-auto">
        <div className="flex h-14 w-14 rotate-[-8deg] items-center justify-center rounded-2xl border border-white/90 bg-[var(--surface)]/75 text-[var(--brand-text)] shadow-[0_12px_35px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-2 group-hover:rotate-0 group-hover:scale-105">
          <BookOpen size={23} strokeWidth={1.7} />
        </div>
      </div>

      {/* Graduation Cap */}
      <div className="group pointer-events-none absolute right-[calc(50%-390px)] top-[26%] hidden sm:block lg:pointer-events-auto">
        <div className="flex h-14 w-14 rotate-[8deg] items-center justify-center rounded-2xl border border-white/90 bg-[var(--surface)]/75 text-[var(--brand-text)] shadow-[0_12px_35px_rgba(232,154,0,0.12)] backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-2 group-hover:rotate-0 group-hover:scale-105">
          <GraduationCap size={24} strokeWidth={1.7} />
        </div>
      </div>

      {/* Pencil */}
      <div className="group pointer-events-none absolute bottom-[24%] left-[calc(50%-365px)] hidden sm:block lg:pointer-events-auto">
        <div className="flex h-12 w-12 rotate-[-12deg] items-center justify-center rounded-2xl border border-white/90 bg-[var(--surface)]/75 text-[var(--accent)] shadow-[0_12px_35px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-2 group-hover:rotate-[-4deg] group-hover:scale-105">
          <Pencil size={20} strokeWidth={1.7} />
        </div>
      </div>

      {/* Lightbulb */}
      <div className="group pointer-events-none absolute bottom-[21%] right-[calc(50%-365px)] hidden sm:block lg:pointer-events-auto">
        <div className="flex h-12 w-12 rotate-[7deg] items-center justify-center rounded-2xl border border-white/90 bg-[var(--surface)]/75 text-[var(--accent)] shadow-[0_12px_35px_rgba(232,154,0,0.10)] backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-2 group-hover:rotate-0 group-hover:scale-105">
          <Lightbulb size={21} strokeWidth={1.7} />
        </div>
      </div>

      {/* Sparkles */}
      <div className="group pointer-events-none absolute left-[calc(50%-245px)] top-[20%] hidden sm:block">
        <Sparkles
          size={17}
          className="rotate-[-12deg] text-[var(--brand-text)]/70 transition-all duration-300 group-hover:rotate-12 group-hover:scale-125"
        />
      </div>

      <div className="group pointer-events-none absolute bottom-[18%] right-[calc(50%-245px)] hidden sm:block">
        <Sparkles
          size={16}
          className="rotate-[12deg] text-[var(--accent)]/70 transition-all duration-300 group-hover:-rotate-12 group-hover:scale-125"
        />
      </div>

      {/* ==================================================
          Main
      ================================================== */}

      <div className="relative z-10 flex min-h-[calc(100vh-3rem)] w-full items-center justify-center sm:min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-[430px]">
          {/* Login Card */}
          <div className="relative overflow-hidden rounded-[24px] border border-[var(--line)] bg-[var(--surface)]/95 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:rounded-[24px] sm:p-8">
            {/* Decorative inner glow */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-[var(--brand-soft)]/60 blur-3xl" />

            {/* Heading */}
            <div className="relative text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-[70px] w-[70px] items-center justify-center rounded-[21px] border border-[var(--line)] bg-[var(--surface-3)] shadow-[0_8px_25px_rgba(0,0,0,0.06)]">
                  <Logo link={"/"} />
                </div>
              </div>

              <h1 className="text-[24px] font-bold tracking-[-0.025em] text-[var(--ink)] sm:text-[26px]">
                Đăng nhập
              </h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="relative mt-7 space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-[13px] font-semibold text-[var(--ink)]"
                >
                  Email
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    strokeWidth={1.8}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--faint)]"
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email của bạn"
                    autoComplete="email"
                    disabled={loading}
                    className="h-12 w-full rounded-full border border-[var(--line)] bg-[var(--surface-3)] py-3 pl-11 pr-4 text-base text-[var(--ink)] outline-none transition-all placeholder:text-[var(--faint)] hover:border-[var(--line)] focus:border-[var(--brand)] focus:bg-[var(--surface)] focus:ring-4 focus:ring-[var(--brand)]/10 disabled:cursor-not-allowed disabled:bg-[var(--surface-2)] sm:text-[13px]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 flex items-center justify-between text-[13px] font-semibold text-[var(--ink)]"
                >
                  <span>Mật khẩu</span>
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    strokeWidth={1.8}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--faint)]"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    autoComplete="current-password"
                    disabled={loading}
                    className="h-12 w-full rounded-full border border-[var(--line)] bg-[var(--surface-3)] py-3 pl-11 pr-12 text-base text-[var(--ink)] outline-none transition-all placeholder:text-[var(--faint)] hover:border-[var(--line)] focus:border-[var(--brand)] focus:bg-[var(--surface)] focus:ring-4 focus:ring-[var(--brand)]/10 disabled:cursor-not-allowed disabled:bg-[var(--surface-2)] sm:text-[13px]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={loading}
                    aria-label={
                      showPassword
                        ? "Ẩn mật khẩu"
                        : "Hiển thị mật khẩu"
                    }
                    className="absolute right-1.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-[var(--faint)] transition-colors hover:text-[var(--brand-text)] disabled:cursor-not-allowed"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group relative mt-1 flex h-12 w-full cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[var(--brand)] px-4 text-[13px] font-semibold text-white shadow-[0_9px_22px_rgba(0,0,0,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--brand-solid)] hover:shadow-[0_13px_28px_rgba(0,0,0,0.14)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {/* Shine */}
                <span className="pointer-events-none absolute inset-y-0 -left-10 w-8 rotate-[20deg] bg-[var(--surface)]/20 transition-all duration-700 group-hover:left-[110%]" />

                <span className="relative">
                  {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </span>
              </button>
            </form>

            {/* Register */}
            <div className="relative mt-6 text-center text-[13px] text-[var(--faint)]">
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="font-semibold text-[var(--brand-text)] transition-colors hover:text-[var(--brand-text)] hover:underline"
              >
                Đăng ký
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-5 flex items-center justify-center gap-2 text-[12px] text-[var(--faint)]">
            <span className="h-px w-8 bg-[var(--line)]" />
            <BookOpen size={12} />
            <span>Achan</span>
            <span className="h-px w-8 bg-[var(--line)]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
