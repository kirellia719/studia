import {
    ArrowLeft,
    Eye,
    EyeOff,
    LockKeyhole,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import profileApi from "@/features/profile/api.js";
import appToast from "@/lib/toast.js";

const ChangePasswordPage = () => {
    const navigate = useNavigate();

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (loading) return;

        const currentPassword = form.currentPassword.trim();
        const newPassword = form.newPassword.trim();
        const confirmPassword = form.confirmPassword.trim();

        // Kiểm tra mật khẩu hiện tại
        if (!currentPassword) {
            appToast.error("Vui lòng nhập mật khẩu hiện tại.");
            return;
        }

        // Kiểm tra mật khẩu mới
        if (!newPassword) {
            appToast.error("Vui lòng nhập mật khẩu mới.");
            return;
        }

        // Kiểm tra độ dài
        if (newPassword.length < 8) {
            appToast.error("Mật khẩu mới phải có ít nhất 8 ký tự.");
            return;
        }

        // Không cho dùng lại mật khẩu cũ
        if (currentPassword === newPassword) {
            appToast.error(
                "Mật khẩu mới phải khác mật khẩu hiện tại."
            );
            return;
        }

        // Kiểm tra xác nhận mật khẩu
        if (!confirmPassword) {
            appToast.error("Vui lòng xác nhận mật khẩu mới.");
            return;
        }

        if (newPassword !== confirmPassword) {
            appToast.error("Mật khẩu xác nhận không khớp.");
            return;
        }

        try {
            setLoading(true);

            const response = await profileApi.changePassword({
                currentPassword,
                newPassword,
                confirmPassword,
            });

            appToast.success(
                response?.message || "Đổi mật khẩu thành công."
            );

            // Xóa dữ liệu sau khi đổi thành công
            setForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            setShowCurrentPassword(false);
            setShowNewPassword(false);

            // Quay lại trang trước sau một khoảng ngắn
            setTimeout(() => {
                navigate(-1);
            }, 800);
        } catch (error) {
            appToast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Đổi mật khẩu thất bại."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-full bg-[var(--surface-3)] text-[var(--ink)]">
            {/* HEADER */}
            <header className="page-band sticky top-0 z-30 h-16">
                <div className="mx-auto flex h-full w-full max-w-[720px] items-center gap-2 px-4 sm:px-6">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
                        aria-label="Quay lại"
                    >
                        <ArrowLeft
                            size={18}
                            strokeWidth={1.8}
                        />
                    </button>

                    <h1 className="text-[17px] font-semibold text-[var(--ink)]">
                        Đổi mật khẩu
                    </h1>

                    <LockKeyhole
                        size={16}
                        strokeWidth={2}
                        className="text-[var(--muted)]"
                    />
                </div>
            </header>

            <div className="mx-auto w-full max-w-[720px] px-4 pb-10 pt-5 sm:px-6">
                <form
                    onSubmit={handleSubmit}
                    className="mt-5 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]"
                >
                    {/* CURRENT PASSWORD */}
                    <div className="border-b border-[var(--surface-2)] p-4">
                        <label
                            htmlFor="currentPassword"
                            className="block text-[12px] font-medium text-[var(--ink)]"
                        >
                            Mật khẩu hiện tại
                        </label>

                        <div className="relative mt-2">
                            <input
                                id="currentPassword"
                                name="currentPassword"
                                type={
                                    showCurrentPassword
                                        ? "text"
                                        : "password"
                                }
                                value={form.currentPassword}
                                onChange={handleChange}
                                placeholder="Nhập mật khẩu hiện tại"
                                disabled={loading}
                                className="h-10 w-full rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 pr-12 text-[12px] text-[var(--ink)] outline-none transition placeholder:text-[var(--faint)] focus:border-[var(--brand-soft)] focus:ring-2 focus:ring-[var(--brand-soft)] disabled:bg-[var(--surface-2)]"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowCurrentPassword(
                                        (current) => !current
                                    )
                                }
                                disabled={loading}
                                className="absolute -right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-[var(--faint)] transition hover:text-[var(--muted)] disabled:cursor-not-allowed"
                                aria-label={
                                    showCurrentPassword
                                        ? "Ẩn mật khẩu"
                                        : "Hiện mật khẩu"
                                }
                            >
                                {showCurrentPassword ? (
                                    <EyeOff size={16} />
                                ) : (
                                    <Eye size={16} />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* NEW PASSWORD */}
                    <div className="border-b border-[var(--surface-2)] p-4">
                        <label
                            htmlFor="newPassword"
                            className="block text-[12px] font-medium text-[var(--ink)]"
                        >
                            Mật khẩu mới
                        </label>

                        <div className="relative mt-2">
                            <input
                                id="newPassword"
                                name="newPassword"
                                type={
                                    showNewPassword
                                        ? "text"
                                        : "password"
                                }
                                value={form.newPassword}
                                onChange={handleChange}
                                placeholder="Nhập mật khẩu mới"
                                disabled={loading}
                                className="h-10 w-full rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 pr-12 text-[12px] text-[var(--ink)] outline-none transition placeholder:text-[var(--faint)] focus:border-[var(--brand-soft)] focus:ring-2 focus:ring-[var(--brand-soft)] disabled:bg-[var(--surface-2)]"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowNewPassword(
                                        (current) => !current
                                    )
                                }
                                disabled={loading}
                                className="absolute -right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-[var(--faint)] transition hover:text-[var(--muted)] disabled:cursor-not-allowed"
                                aria-label={
                                    showNewPassword
                                        ? "Ẩn mật khẩu"
                                        : "Hiện mật khẩu"
                                }
                            >
                                {showNewPassword ? (
                                    <EyeOff size={16} />
                                ) : (
                                    <Eye size={16} />
                                )}
                            </button>
                        </div>

                        <p className="mt-2 text-[12px] leading-4 text-[var(--faint)]">
                            Nên sử dụng ít nhất 8 ký tự, bao gồm chữ và số.
                        </p>
                    </div>

                    {/* CONFIRM PASSWORD */}
                    <div className="p-4">
                        <label
                            htmlFor="confirmPassword"
                            className="block text-[12px] font-medium text-[var(--ink)]"
                        >
                            Xác nhận mật khẩu mới
                        </label>

                        <div className="relative mt-2">
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={
                                    showNewPassword
                                        ? "text"
                                        : "password"
                                }
                                value={form.confirmPassword}
                                onChange={handleChange}
                                placeholder="Nhập lại mật khẩu mới"
                                disabled={loading}
                                className="h-10 w-full rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 pr-12 text-[12px] text-[var(--ink)] outline-none transition placeholder:text-[var(--faint)] focus:border-[var(--brand-soft)] focus:ring-2 focus:ring-[var(--brand-soft)] disabled:bg-[var(--surface-2)]"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowNewPassword(
                                        (current) => !current
                                    )
                                }
                                disabled={loading}
                                className="absolute -right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-[var(--faint)] transition hover:text-[var(--muted)] disabled:cursor-not-allowed"
                                aria-label={
                                    showNewPassword
                                        ? "Ẩn mật khẩu"
                                        : "Hiện mật khẩu"
                                }
                            >
                                {showNewPassword ? (
                                    <EyeOff size={16} />
                                ) : (
                                    <Eye size={16} />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* ACTION */}
                    <div className="border-t border-[var(--surface-2)] px-4 py-3 text-right">
                        <button
                            type="submit"
                            disabled={loading}
                            className="h-10 px-3 rounded-full bg-[var(--brand-solid)] text-[12px] font-medium text-white transition hover:bg-[var(--brand-solid-hover)] active:bg-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading
                                ? "Đang cập nhật..."
                                : "Cập nhật mật khẩu"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordPage;
