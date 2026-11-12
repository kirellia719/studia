import { useEffect, useMemo, useState } from "react";
import { Camera, Check, ChevronLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/stores/authStore";
import appToast from "@/lib/toast.js";
import profileApi from "@/features/profile/api.js";
import { ANIMAL_AVATARS } from "@/features/profile/avatars.js";

const DEFAULT_AVATAR = ANIMAL_AVATARS[0]?.url || "";

const getRoleLabel = (role) => {
    switch (role) {
        case "STUDENT":
            return "Học viên";
        case "TEACHER":
            return "Giáo viên";
        case "ADMIN":
            return "Quản trị viên";
        default:
            return role || "-";
    }
};

const PersonalProfilePage = () => {
    const navigate = useNavigate();

    const { user, setUser } = useAuthStore();

    const [name, setName] = useState("");
    const [selectedAvatar, setSelectedAvatar] =
        useState(DEFAULT_AVATAR);

    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    /**
     * Đồng bộ dữ liệu từ authStore
     */
    useEffect(() => {
        setName(user?.name || "");
        setSelectedAvatar(user?.avatar || DEFAULT_AVATAR);
    }, [user?.name, user?.avatar]);

    useEffect(() => {
        if (isAvatarModalOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [isAvatarModalOpen]);

    /**
     * Avatar hiện tại
     * selectedAvatar là URL string
     */
    const currentAvatar = useMemo(() => {
        return selectedAvatar || DEFAULT_AVATAR;
    }, [selectedAvatar]);

    /**
     * Kiểm tra dữ liệu có thay đổi không
     */
    const hasChanges =
        name.trim() !== (user?.name || "") ||
        selectedAvatar !== (user?.avatar || DEFAULT_AVATAR);

    /**
     * Lưu thông tin
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        const newName = name.trim();

        if (!newName) {
            return;
        }

        if (!hasChanges) {
            return;
        }

        setIsSaving(true);
        setIsSaved(false);

        try {
            const response = await profileApi.updateMe({
                name: newName,
                avatar: selectedAvatar,
            });

            const updatedUser = response?.data;

            setUser({
                ...user,
                ...updatedUser,
                name: newName,
                avatar: selectedAvatar,
            });

            setIsSaved(true);

            setTimeout(() => {
                setIsSaved(false);
            }, 2000);
        } catch (error) {
            console.error(
                "Failed to update profile:",
                error
            );

            appToast.error(
                error?.response?.data?.message ||
                    "Không thể lưu thay đổi. Vui lòng thử lại."
            );
        } finally {
            setIsSaving(false);
        }
    };

    /**
     * Quay lại
     */
    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="min-h-full bg-[var(--surface-3)] text-[var(--ink)]">
            {/* ==================== HEADER ==================== */}
            <header className="page-band sticky top-0 z-30 h-16">
                <div className="mx-auto flex h-full max-w-[720px] items-center px-4 sm:px-6">
                    {/* Back */}
                    <button
                        type="button"
                        onClick={handleBack}
                        className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
                        aria-label="Quay lại"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    {/* Title */}
                    <h1 className="flex-1 text-center text-[15px] font-semibold text-[var(--ink)]">
                        Hồ sơ
                    </h1>

                    {/* Spacer để title nằm chính giữa */}
                    <div className="h-11 w-11" />
                </div>
            </header>

            {/* ==================== CONTENT ==================== */}
            <div className="mx-auto max-w-[720px] p-3 sm:px-6">
                <div className="space-y-4">
                    {/* ==================== AVATAR ==================== */}
                    <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
                        <div className="flex flex-col items-center">
                            {/* Avatar */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsAvatarModalOpen(true)
                                    }
                                    className="group relative h-24 w-24 overflow-hidden rounded-full bg-[var(--brand-soft)] ring-4 ring-white shadow-sm"
                                    aria-label="Thay đổi avatar"
                                >
                                    <img
                                        src={currentAvatar}
                                        alt="Avatar"
                                        className="h-full w-full object-cover"
                                    />

                                    {/* Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                                        <span className="rounded-md bg-black/50 px-2 py-1 text-[12px] font-medium text-white opacity-0 transition group-hover:opacity-100">
                                            Đổi
                                        </span>
                                    </div>
                                </button>

                                {/* Camera button */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsAvatarModalOpen(true)
                                    }
                                    className="group absolute bottom-0 right-0 flex h-11 w-11 items-center justify-center rounded-full"
                                    aria-label="Chọn avatar"
                                >
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[var(--solid)] text-white shadow-sm transition group-hover:bg-[var(--solid-hover)]">
                                        <Camera
                                            size={13}
                                            strokeWidth={2}
                                        />
                                    </span>
                                </button>
                            </div>

                            {/* Name */}
                            <div className="mt-3 text-center">
                                <p className="mt-1 text-[13px] text-[var(--muted)]">
                                    {getRoleLabel(user?.role)}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* ==================== PERSONAL INFO ==================== */}
                    <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
                        <form onSubmit={handleSubmit}>
                            {/* Section header */}
                            <div className="border-b border-[var(--line)] px-5 py-4">
                                <h2 className="text-[13px] font-semibold text-[var(--ink)]">
                                    Thông tin cá nhân
                                </h2>

                                <p className="mt-1 text-[12px] text-[var(--muted)]">
                                    Cập nhật thông tin cá nhân của bạn.
                                </p>
                            </div>

                            {/* Fields */}
                            <div className="space-y-4 px-5 py-5">
                                {/* ==================== NAME ==================== */}
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="mb-1.5 block text-[12px] font-medium text-[var(--ink-2)]"
                                    >
                                        Họ và tên
                                    </label>

                                    <input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        placeholder="Nhập họ và tên"
                                        className="h-11 w-full rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 text-base text-[var(--ink)] outline-none transition placeholder:text-[var(--faint)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10 sm:text-sm"
                                    />
                                </div>

                                {/* ==================== EMAIL ==================== */}
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="mb-1.5 block text-[12px] font-medium text-[var(--ink-2)]"
                                    >
                                        Email
                                    </label>

                                    <input
                                        id="email"
                                        type="email"
                                        value={user?.email || ""}
                                        disabled
                                        className="h-11 w-full cursor-not-allowed rounded-full border border-[var(--line)] bg-[var(--surface-2)] px-3 text-base text-[var(--muted)] outline-none sm:text-sm"
                                    />
                                </div>

                                {/* ==================== STUDENT CODE ==================== */}
                                {user?.role === "STUDENT" && (
                                    <div>
                                        <label
                                            htmlFor="studentCode"
                                            className="mb-1.5 block text-[12px] font-medium text-[var(--ink-2)]"
                                        >
                                            Mã học viên
                                        </label>

                                        <input
                                            id="studentCode"
                                            type="text"
                                            value={
                                                user?.studentCode || ""
                                            }
                                            disabled
                                            className="h-11 w-full cursor-not-allowed rounded-full border border-[var(--line)] bg-[var(--surface-2)] px-3 text-base text-[var(--muted)] outline-none sm:text-sm"
                                        />
                                    </div>
                                )}

                                {/* ==================== SAVE ==================== */}
                                <div className="flex items-center justify-between border-t border-[var(--line)] pt-4">
                                    {/* Saved message */}
                                    <div>
                                        {isSaved && (
                                            <div className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--success)]">
                                                <Check size={14} />

                                                <span>
                                                    Đã lưu thay đổi
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Save button */}
                                    <button
                                        type="submit"
                                        disabled={
                                            isSaving ||
                                            !name.trim() ||
                                            !hasChanges
                                        }
                                        className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--solid)] px-4 text-[13px] font-medium text-white transition hover:bg-[var(--solid-hover)] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        {isSaving
                                            ? "Đang lưu..."
                                            : "Lưu thay đổi"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </section>
                </div>
            </div>

            <div
                className={`fixed inset-0 z-50 flex items-end justify-center bg-black/40 transition-opacity duration-200 sm:items-center sm:p-4 ${isAvatarModalOpen
                    ? "visible opacity-100"
                    : "invisible pointer-events-none opacity-0"
                    }`}
            >
                <div
                    className={`flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-3xl bg-[var(--surface)] shadow-xl transition-transform duration-200 sm:max-w-[520px] sm:rounded-3xl ${isAvatarModalOpen
                        ? "translate-y-0"
                        : "translate-y-4 sm:translate-y-2"
                        }`}
                >
                    {/* Header */}
                    <div className="flex shrink-0 items-center justify-between border-b border-[var(--line)] px-5 py-4">
                        <div>
                            <h2 className="text-[14px] font-semibold text-[var(--ink)]">
                                Chọn avatar
                            </h2>

                            <p className="mt-0.5 text-[12px] text-[var(--muted)]">
                                Chọn hình đại diện cho hồ sơ của bạn.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsAvatarModalOpen(false)}
                            aria-label="Đóng"
                            className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
                        >
                            <X size={17} />
                        </button>
                    </div>

                    {/* CHỈ PHẦN NÀY ĐƯỢC SCROLL */}
                    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
                        <div className="grid grid-cols-4 gap-x-4 gap-y-5 sm:grid-cols-5">
                            {ANIMAL_AVATARS.map((avatar) => {
                                const isSelected =
                                    selectedAvatar === avatar.url;

                                return (
                                    <button
                                        key={avatar.id}
                                        type="button"
                                        onClick={() =>
                                            setSelectedAvatar(avatar.url)
                                        }
                                        className="group flex min-w-0 flex-col items-center gap-2"
                                    >
                                        <div className="relative h-16 w-16 shrink-0">
                                            <div
                                                className={`h-16 w-16 overflow-hidden rounded-full bg-[var(--surface-2)] ${isSelected
                                                    ? "ring-2 ring-[var(--brand)] ring-offset-2"
                                                    : "ring-1 ring-[var(--line)]"
                                                    }`}
                                            >
                                                <img
                                                    src={avatar.url}
                                                    alt={avatar.name}
                                                    loading="lazy"
                                                    decoding="async"
                                                    width={128}
                                                    height={128}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>

                                            {isSelected && (
                                                <span className="absolute -bottom-1 -right-1 z-10 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[var(--brand-solid)] text-white shadow-sm">
                                                    <Check
                                                        size={11}
                                                        strokeWidth={3}
                                                    />
                                                </span>
                                            )}
                                        </div>

                                        <span className="w-full truncate px-1 text-center text-[12px] text-[var(--muted)]">
                                            {avatar.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex shrink-0 justify-end border-t border-[var(--line)] bg-[var(--surface)] px-5 py-4">
                        <button
                            type="button"
                            onClick={() => setIsAvatarModalOpen(false)}
                            className="h-9 rounded-full bg-[var(--solid)] px-4 text-[12px] font-medium text-white transition hover:bg-[var(--solid-hover)]"
                        >
                            Chọn avatar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalProfilePage;
