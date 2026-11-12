import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";

import Logo from "@/components/ui/Logo.jsx";
import authApi from "@/features/auth/api.js";
import appToast from "@/lib/toast.js";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!name.trim()) {
      appToast.error("Vui lòng nhập họ và tên.");
      return;
    }

    if (!email.trim()) {
      appToast.error("Vui lòng nhập email.");
      return;
    }

    if (!password) {
      appToast.error("Vui lòng nhập mật khẩu.");
      return;
    }

    if (password !== confirmPassword) {
      appToast.error("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);

    try {
      const result = await authApi.register({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      appToast.success(result.message);

      navigate("/login");
    } catch (error) {
      console.log(error);

      appToast.error(
        error?.response?.data?.message ||
        error.message ||
        "Đăng ký không thành công."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass = [
    "h-11 w-full",
    "rounded-xl",
    "border border-[var(--line)]",
    "bg-[var(--surface)]",
    "py-2.5",
    "text-base text-[var(--ink)] sm:text-sm",
    "outline-none",
    "transition-colors",
    "placeholder:text-[var(--faint)]",
    "hover:border-[var(--line-strong)]",
    "focus:border-[var(--brand)]",
    "focus:ring-2 focus:ring-[var(--brand-soft)]",
    "disabled:cursor-not-allowed",
    "disabled:bg-[var(--surface-3)]",
    "disabled:text-[var(--faint)]",
  ].join(" ");

  const labelClass =
    "mb-1.5 block text-xs font-medium text-[var(--ink-2)]";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg)] px-4 py-6 sm:px-6 sm:py-8">
      {/* Background */}
      <div className="pointer-events-none absolute left-1/2 top-[-120px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[var(--brand-soft)] blur-[100px] sm:h-[520px] sm:w-[520px]" />

      <div className="pointer-events-none absolute -bottom-40 -right-32 h-[360px] w-[360px] rounded-full bg-[var(--success-soft)] blur-[100px]" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(circle at center, black 0%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(circle at center, black 0%, transparent 70%)",
        }}
      />

      {/* Main */}
      <div className="relative z-10 flex min-h-[calc(100vh-3rem)] w-full items-center justify-center sm:min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-[430px]">
          {/* Card */}
          <div className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_16px_45px_rgba(24,24,27,0.06)] sm:rounded-3xl sm:p-8">
            {/* Header */}
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--surface-3)]">
                  <Logo link="/" />
                </div>
              </div>

              <h1 className="text-xl font-semibold tracking-tight text-[var(--ink)] sm:text-2xl">
                Tạo tài khoản
              </h1>

              <p className="mt-1.5 text-xs text-[var(--muted)]">
                Tạo tài khoản để bắt đầu học tập.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-4"
            >
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className={labelClass}
                >
                  Họ và tên
                </label>

                <div className="relative">
                  <User
                    size={17}
                    strokeWidth={1.8}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--faint)]"
                  />

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="Nhập họ và tên"
                    autoComplete="name"
                    disabled={loading}
                    className={`${inputClass} pl-10 pr-4`}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className={labelClass}
                >
                  Email
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    strokeWidth={1.8}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--faint)]"
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="Nhập email của bạn"
                    autoComplete="email"
                    disabled={loading}
                    className={`${inputClass} pl-10 pr-4`}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className={labelClass}
                >
                  Mật khẩu
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    strokeWidth={1.8}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--faint)]"
                  />

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Nhập mật khẩu"
                    autoComplete="new-password"
                    disabled={loading}
                    className={`${inputClass} pl-10 pr-11`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (prev) => !prev
                      )
                    }
                    disabled={loading}
                    aria-label={
                      showPassword
                        ? "Ẩn mật khẩu"
                        : "Hiển thị mật khẩu"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--faint)] transition-colors hover:text-[var(--ink-2)] disabled:cursor-not-allowed"
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className={labelClass}
                >
                  Xác nhận mật khẩu
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={17}
                    strokeWidth={1.8}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--faint)]"
                  />

                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="Nhập lại mật khẩu"
                    autoComplete="new-password"
                    disabled={loading}
                    className={`${inputClass} pl-10 pr-11`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (prev) => !prev
                      )
                    }
                    disabled={loading}
                    aria-label={
                      showConfirmPassword
                        ? "Ẩn mật khẩu"
                        : "Hiển thị mật khẩu"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[var(--faint)] transition-colors hover:text-[var(--ink-2)] disabled:cursor-not-allowed"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={[
                  "mt-1 flex h-11 w-full",
                  "items-center justify-center",
                  "rounded-full",
                  "bg-[var(--solid)]",
                  "px-4",
                  "text-sm font-semibold text-white",
                  "transition-colors",
                  "hover:bg-[var(--solid-hover)]",
                  "focus:outline-none",
                  "focus:ring-2 focus:ring-[var(--line-strong)]",
                  "disabled:cursor-not-allowed",
                  "disabled:opacity-60",
                ].join(" ")}
              >
                {loading
                  ? "Đang đăng ký..."
                  : "Đăng ký"}
              </button>
            </form>

            {/* Login */}
            <div className="mt-5 text-center text-xs text-[var(--muted)]">
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="font-semibold text-[var(--brand-text)] transition-colors hover:text-[var(--brand-text)] hover:underline"
              >
                Đăng nhập
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-5 text-center text-[12px] text-[var(--faint)]">
            Achan
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
