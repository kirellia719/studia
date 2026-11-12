import { useEffect, useMemo, useState } from "react";

import { CalendarPlus, X } from "lucide-react";

import appToast from "@/lib/toast.js";
import formatDate from "@/lib/format/formatDate.js";
import enrollmentApi from "@/features/enrollments/api.js";

const BASE_OPTIONS = [1, 3, 6, 12];

const RenewEnrollmentModal = ({
    open,
    enrollment,
    courseDurationMonths,
    onClose,
    onRenewed,
}) => {
    const options = useMemo(() => {
        const values = new Set(BASE_OPTIONS);

        if (
            Number.isInteger(courseDurationMonths) &&
            courseDurationMonths > 0
        ) {
            values.add(courseDurationMonths);
        }

        return [...values].sort((a, b) => a - b);
    }, [courseDurationMonths]);

    const [months, setMonths] = useState(3);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open) return;

        setMonths(
            Number.isInteger(courseDurationMonths) &&
                courseDurationMonths > 0
                ? courseDurationMonths
                : 3
        );
    }, [open, courseDurationMonths]);

    if (!open || !enrollment) {
        return null;
    }

    const studentName =
        enrollment.student?.name ||
        enrollment.studentName ||
        "học sinh";

    const expiresAt = enrollment.expiresAt;

    const handleClose = () => {
        if (submitting) return;

        onClose();
    };

    const handleSubmit = async () => {
        if (submitting) return;

        try {
            setSubmitting(true);

            const response =
                await enrollmentApi.updateExpiration(
                    enrollment.id,
                    months
                );

            onRenewed?.(response.data);

            appToast.success("Đã gia hạn khóa học.");
            onClose();
        } catch (error) {
            console.error("Renew enrollment error:", error);

            appToast.error(
                error?.response?.data?.message ||
                "Không thể gia hạn khóa học."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="renew-enrollment-title"
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center sm:px-3"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    handleClose();
                }
            }}
        >
            <div
                className="w-full max-w-[420px] rounded-t-3xl border border-[var(--line)] bg-[var(--surface)] shadow-xl sm:rounded-3xl"
                onMouseDown={(event) => event.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
                    <div className="flex min-w-0 items-center gap-2">
                        <CalendarPlus
                            size={17}
                            strokeWidth={1.9}
                            className="shrink-0 text-[var(--brand-text)]"
                        />

                        <h2
                            id="renew-enrollment-title"
                            className="truncate text-sm font-semibold text-[var(--ink)]"
                        >
                            Gia hạn khóa học
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={submitting}
                        aria-label="Đóng"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--faint)] transition hover:bg-[var(--surface-2)] hover:text-[var(--ink-2)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-4 py-4">
                    <div className="rounded-xl bg-[var(--surface-3)] px-3.5 py-3">
                        <p className="truncate text-[13px] font-semibold text-[var(--ink)]">
                            {studentName}
                        </p>

                        <p className="mt-0.5 text-[12px] text-[var(--muted)]">
                            Hết hạn ngày{" "}
                            {formatDate(expiresAt)}
                        </p>
                    </div>

                    <p className="mt-4 text-[12px] font-medium text-[var(--ink-2)]">
                        Gia hạn thêm
                    </p>

                    <div className="mt-2 grid grid-cols-4 gap-2">
                        {options.map((option) => {
                            const isActive = option === months;

                            return (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() =>
                                        setMonths(option)
                                    }
                                    disabled={submitting}
                                    aria-pressed={isActive}
                                    className={[
                                        "h-11 rounded-full border",
                                        "text-[13px] font-semibold",
                                        "transition-colors duration-150",
                                        "disabled:cursor-not-allowed disabled:opacity-60",
                                        isActive
                                            ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand-text)]"
                                            : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--surface-3)]",
                                    ].join(" ")}
                                >
                                    {option} tháng
                                </button>
                            );
                        })}
                    </div>

                    <p className="mt-3 text-[12px] leading-5 text-[var(--faint)]">
                        Thời hạn mới được cộng từ ngày hết hạn
                        hiện tại; nếu khóa đã hết hạn thì tính
                        từ hôm nay.
                    </p>
                </div>

                {/* Footer */}
                <div className="flex gap-2 border-t border-[var(--line)] px-4 py-3 pb-[calc(0.75rem_+_env(safe-area-inset-bottom))] sm:pb-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={submitting}
                        className="h-11 flex-1 rounded-full border border-[var(--line)] bg-[var(--surface)] text-[13px] font-medium text-[var(--muted)] transition hover:bg-[var(--surface-3)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Hủy
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="h-11 flex-[1.4] rounded-full bg-[var(--brand-solid)] text-[13px] font-semibold text-white transition hover:bg-[var(--brand-solid-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting
                            ? "Đang gia hạn..."
                            : "Xác nhận"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RenewEnrollmentModal;
